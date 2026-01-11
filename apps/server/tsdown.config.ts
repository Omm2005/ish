import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  external: [],
  noExternal: [
    "@ish/auth",
    "@ish/db",
    "@ish/env",
    // Add other @ish/* packages here
  ],
  bundle: true,
});
