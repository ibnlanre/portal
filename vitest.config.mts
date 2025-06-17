import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vitest/config";

const exclude = [
  "./node_modules/**",
  "./dist/**",
  "**/types/**",
  "**/*.config.*",
  "**/*.d.ts",
  "**/*.json",
  "**/*.test.*",
];

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      clean: true,
      exclude,
      include: ["**/*.ts"],
    },
    environment: "happy-dom",
    globals: true,
    logHeapUsage: true,
    setupFiles: "vitest.setup.ts",
  },
});
