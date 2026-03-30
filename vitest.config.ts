import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "lcov", "html"],
      include: ["src/**"],
      exclude: ["src/index.ts"]
    }
  }
});
