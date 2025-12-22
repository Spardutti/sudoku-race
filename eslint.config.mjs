import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      "react-you-might-not-need-an-effect": reactYouMightNotNeedAnEffect,
    },
    rules: {
      // React Compiler rules - help identify code that prevents optimization
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Code quality standards
      "max-lines": [
        "error",
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "no-promise-executor-return": "error",
      "no-async-promise-executor": "error",
      "prefer-promise-reject-errors": "error",
      complexity: ["error", 20],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message:
                "Use absolute imports with @/ instead of relative paths (../ or ./)",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Testing artifacts:
    "coverage/**",
    "jest.config.js",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
