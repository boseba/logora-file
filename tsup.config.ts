import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: false,
  target: "es2019",
  skipNodeModulesBundle: true,
});
