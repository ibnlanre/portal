import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";

/**
 * @type {import("vitest/config").Config}
 */
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: "vitest.setup.ts",
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
