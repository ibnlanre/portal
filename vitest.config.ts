import react from "@vitejs/plugin-react";

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
const app = resolve(__dirname, "./");

/**
 * @type {import("vitest/config").Config}
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: app }],
  },
  test: {
    coverage: {
      clean: true,
      exclude: [
        "./dist/**",
        "./index.ts",
        "**/types/**",
        "**/*.config.*",
        "**/*.d.ts",
        "**/*.json",
        "**/*.test.*",
      ],
      include: ["**/*.ts"],
    },
    environment: "happy-dom",
    globals: true,
    logHeapUsage: true,
    reporters: [],
    setupFiles: "vitest.setup.ts",
  },
});
