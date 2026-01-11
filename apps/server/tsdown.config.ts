import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  // Bundle everything - don't externalize anything
  external: [],
  noExternal: [
    "@ish/auth",
    "@ish/db", 
    "@ish/env",
    // Add any other @ish/* workspace packages you're using
  ],
  bundle: true,
  minify: false,
  dts: false,
});