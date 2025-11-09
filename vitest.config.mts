import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig, defaultExclude } from "vitest/config";

const ignoreFiles = ["**/*.{test,json}.*", "**/types/**", "**/*.d.ts"];

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    logHeapUsage: false,
    reporters: ["default"],
    coverage: {
      clean: true,
      exclude: defaultExclude.concat(ignoreFiles),
      include: ["**/*.ts"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "browser",
          environment: "happy-dom",
          setupFiles: "vitest.setup.ts",
          exclude: defaultExclude.concat(["**/*.ssr.test.ts"]),
        },
      },
      {
        extends: true,
        test: {
          name: "ssr",
          environment: "node",
          include: ["**/*.ssr.test.ts"],
        },
      },
    ],
  },
});
