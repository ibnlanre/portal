import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";
const app = resolve(__dirname, "./");

/**
 * @type {import("vitest/config").Config}
 */
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: "vitest.setup.ts",
    environment: "happy-dom",
    globals: true,
    coverage: {
      include: ["**/*.ts"],
      exclude: [
        "./dist/**",
        "./index.ts",
        "**/types/**",
        "**/*.config.*",
        "**/*.d.ts",
        "**/*.json",
        "**/*.test.*",
      ],
      clean: true,
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: app }],
  },
});
