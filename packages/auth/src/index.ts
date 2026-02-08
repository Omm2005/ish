import { expo } from "@better-auth/expo";
import { db } from "@ish/db";
import * as schema from "@ish/db/schema/auth";
import { env } from "@ish/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
database: drizzleAdapter(db, {
provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [
		env.CORS_ORIGIN,
		"mybettertapp://",
		...(env.NODE_ENV === "development"
			? [
				"exp://",
				"exp://**",
				"exp://192.168.*.*:*/**",
				"http://localhost:8081",
			]
			: []),
	],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: 'select_account',
    },
  },
  advanced: {
    defaultCookieAttributes: {
      // In dev, secure cookies on http://localhost won't be set, causing state mismatches.
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
  plugins: [expo()],
});
