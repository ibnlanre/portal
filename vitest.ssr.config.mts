import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

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
    environment: "node",
    include: ["**/*.ssr.test.ts"],
    globals: true,
    logHeapUsage: false,
    reporters: ["default"],
  },
});
