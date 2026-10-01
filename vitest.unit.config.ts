import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(rootDir, "./app"),
      "@": path.resolve(rootDir, "./app"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["app/__tests__/unit/**/*.test.ts"],
  },
})
