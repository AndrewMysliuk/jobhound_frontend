import eslint from "@eslint/js"
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"
import eslintConfigPrettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import pluginVue from "eslint-plugin-vue"

const useFastDevLint = process.env.ESLINT_MODE !== "strict" && (process.env.ESLINT_MODE === "light" || process.env.npm_lifecycle_event === "serve")

const typeCheckedRules = {
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": "error",
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/require-await": "warn",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-unsafe-argument": "error",
  "@typescript-eslint/strict-boolean-expressions": "off",
}

const sharedRules = {
  "no-undef": "off",
  "no-unsafe-optional-chaining": "error",
  "vue/no-v-model-argument": "off",
  "vue/multi-word-component-names": "off",
  "vue/no-reserved-component-names": "off",
  "vue/valid-v-model": "error",
  "@typescript-eslint/ban-ts-comment": [
    "warn",
    {
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
      minimumDescriptionLength: 3,
    },
  ],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-empty-function": "warn",
  "no-useless-escape": "error",
  "prefer-rest-params": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  "no-useless-catch": "error",
  "@typescript-eslint/no-var-requires": "off",
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "simple-import-sort/imports": [
    "warn",
    {
      groups: [["^node:"], ["^vue", "^nuxt", "^#", "^@?\\w"], ["^~/"], ["^\\.\\.(?!/?$)", "^\\.\\./?$"], ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"], ["^.+\\.s?css$"]],
    },
  ],
  "simple-import-sort/exports": "warn",
  "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
}

export default defineConfigWithVueTs(
  {
    ignores: [".output/**", ".nuxt/**", "dist/**", "node_modules/**", "coverage/**", "*.min.js"],
  },
  pluginVue.configs["flat/strongly-recommended"],
  eslint.configs.recommended,
  vueTsConfigs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: sharedRules,
  },
  ...(useFastDevLint ? [] : [vueTsConfigs.recommendedTypeChecked, { rules: typeCheckedRules }]),
  {
    files: ["app/__tests__/**/*.ts"],
    rules: {
      "@typescript-eslint/require-await": "off",
    },
  },
  {
    files: ["nuxt.config.ts", "*.cjs", "vitest.unit.config.ts", "vitest.integration.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "prefer-rest-params": "off",
    },
  }
)
