import "eslint-plugin-only-warn";

import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { defineConfig } from "eslint/config";

import eslintReact from "@eslint-react/eslint-plugin";
import stylisticJsx from "@stylistic/eslint-plugin";
import typescript from "@typescript-eslint/parser";
import vitestPlugin from "@vitest/eslint-plugin";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tsPaths from "eslint-plugin-paths";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import reactRedux from "eslint-plugin-react-redux";
import risxss from "eslint-plugin-risxss";
import storybookPlugin from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

const EXT = {
  COMMONJS: "**/*.cjs",
  CSS: "**/*.{css,scss,sass,less}",
  DEFINITION_FILES: "**/*.{d.ts,tsbuildinfo}",
  HTML: "**/*.{htm,html,xml,xhtml}",
  JS: "**/*.{js,jsx}",
  JSON: "**/*.{json,json5,jsonc}",
  MD: "**/*.{md,mdx,markdown}",
  MODULE: "**/*.{mjs,mjsx,mtsx}",
  STORYBOOK: "**/*.{stories,story}.{js,jsx,ts,tsx}",
  TEST: "**/*.{spec,test,cy}.{js,ts,jsx,tsx}",
  TS: "**/*.{ts,tsx}",
  TYPE_DEFINITION: "**/types/**",
  YML: "**/*.{yml,yaml}",
};

const ignoresConfig = tseslint.config({
  ignores: [
    ".storybook",
    "**/node_modules/**",
    "**/coverage/**",
    "**/build/**",
    "**/public/**",
    "**/dist/**",
    "**/.vscode/**",
    "**/.github/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/.vercel/**",
    "**/.output/**",
    "**/.yarn/**",
    "**/.yarn-cache/**",
    "**/.yarnrc.yml",
    "**/.yarnrc",
    "**/yarn.lock",
    "**/package.json",
    "**/package-lock.json",
    "**/pnpm-lock.yaml",
    "**/npm-shrinkwrap.json",
    "**/lerna-debug.log",
    "**/lerna.json",
    "**/tsconfig*.tsbuildinfo",
    "**/*.d.ts",
  ],
});

const vitestConfig = tseslint.config({
  extends: [vitestPlugin.configs.recommended],
  files: [EXT.JS, EXT.COMMONJS, EXT.MODULE, EXT.TEST],
  ignores: [EXT.DEFINITION_FILES, EXT.TYPE_DEFINITION],
  languageOptions: {
    globals: globals.vitest,
  },
  plugins: { vitest: vitestPlugin },
  rules: {
    ...vitestPlugin.configs.recommended.rules,
    "vitest/expect-expect": false,
  },
});

const importConfig = tseslint.config({
  extends: [importX.flatConfigs.react, importX.flatConfigs.typescript],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parser: typescript,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { typescript },
  rules: {
    "import-x/no-cycle": ["warn", { maxDepth: "∞" }],
  },
  settings: {
    "import-x/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import-x/ignore": ["node_modules", "\\.(coffee|scss|css|less|hbs|svg)$"],
    "import-x/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import-x/resolver-next": [
      createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      }),
    ],
  },
});

const typescriptConfig = tseslint.config({
  extends: [tseslint.configs.eslintRecommended],
  files: [EXT.TS],
  ignores: [EXT.DEFINITION_FILES, EXT.TYPE_DEFINITION, EXT.TEST],
  languageOptions: {
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      projectService: true,
    },
  },
  plugins: { "ts-paths": tsPaths },
  rules: {
    "ts-paths/alias": ["warn"],
  },
});

const reactConfig = tseslint.config({
  extends: [
    jsxA11y.flatConfigs.recommended,
    eslintReact.configs["recommended-typescript"],
  ],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.vitest,
    },
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: {
    "@stylistic/jsx": stylisticJsx,
    jsxA11y,
    "react-redux": reactRedux,
    risxss,
  },
  rules: {
    ...reactRedux.configs.recommended.rules,
    "@stylistic/jsx/jsx-self-closing-comp": "warn",
    "risxss/catch-potential-xss-react": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});

const perfectionistConfig = tseslint.config({
  files: [EXT.COMMONJS, EXT.JS, EXT.MODULE, EXT.TS, EXT.JSON, EXT.YML],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { perfectionist },
  rules: {
    ...perfectionist.configs["recommended-natural"].rules,
    "perfectionist/sort-exports": [
      "warn",
      {
        fallbackSort: { order: "asc", type: "alphabetical" },
        groups: ["type-export", ["value-export", "unknown"]],
        partitionByNewLine: true,
        type: "natural",
      },
    ],
    "perfectionist/sort-imports": [
      "warn",
      {
        fallbackSort: { order: "asc", type: "alphabetical" },
        groups: [
          ["type-builtin", "type-subpath", "type-external"],
          ["type-internal", "type-parent", "type-sibling", "type-index"],
          ["named-type-builtin", "named-type-subpath", "named-type-external"],
          [
            "named-type-internal",
            "named-type-parent",
            "named-type-sibling",
            "named-type-index",
          ],
          ["ts-equals-import"],
          [
            "named-value-builtin",
            "named-value-subpath",
            "named-value-external",
          ],
          ["named-value-internal"],
          ["named-value-parent", "named-value-sibling", "named-value-index"],
          ["value-builtin", "value-subpath", "value-external"],
          ["value-internal"],
          ["value-parent", "value-sibling", "value-index"],
          ["value-side-effect", "value-side-effect-style"],
          ["require-import"],
          ["unknown"],
        ],
        type: "natural",
      },
    ],
  },
});

const storybookConfig = tseslint.config({
  extends: storybookPlugin.configs["flat/recommended"],
  files: [EXT.STORYBOOK],
  languageOptions: {
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  plugins: { storybookPlugin },
});

const prettierConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { prettier },
  rules: {
    "prettier/prettier": [
      "warn",
      {
        arrowParens: "always",
        bracketSameLine: false,
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        endOfLine: "lf",
        experimentalTernaries: false,
        htmlWhitespaceSensitivity: "css",
        insertPragma: false,
        jsxSingleQuote: false,
        printWidth: 80,
        proseWrap: "preserve",
        quoteProps: "as-needed",
        requirePragma: false,
        semi: true,
        singleAttributePerLine: false,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "es5",
        useTabs: false,
        vueIndentScriptAndStyle: false,
      },
    ],
  },
});

export default defineConfig([
  ignoresConfig,
  vitestConfig,
  importConfig,
  typescriptConfig,
  reactConfig,
  perfectionistConfig,
  prettierConfig,
  storybookConfig,
]);
