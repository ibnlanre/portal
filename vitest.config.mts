import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig, defaultExclude } from "vitest/config";

const exclude = defaultExclude.concat([
  "**/*.{test,json}.*",
  "**/types/**",
  "**/*.d.ts",
]);

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
    logHeapUsage: false,
    setupFiles: "vitest.setup.ts",
    reporters: ["default"],
  },
});
