import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@ish/auth";
import { env } from "@ish/env/server";
import { streamText, convertToModelMessages, wrapLanguageModel } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.onError((err, c) => {
  // Log full error details for debugging 500s
  console.error("[server] Unhandled error:", err);
  return c.text("Internal Server Error", 500);
});
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  // Better Auth mutates request headers; clone with mutable headers for Workers/immutable envs.
  const raw = c.req.raw;
  const req = new Request(raw, {
    headers: new Headers(raw.headers),
  });
  return auth.handler(req);
});

app.post("/ai", async (c) => {
  const body = await c.req.json();
  const uiMessages = body.messages || [];
  const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  const model = wrapLanguageModel({
    model: google("gemini-2.5-flash"),
    middleware: devToolsMiddleware(),
  });
  const result = streamText({
    model,
    messages: await convertToModelMessages(uiMessages),
  });

  return result.toUIMessageStreamResponse();
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
