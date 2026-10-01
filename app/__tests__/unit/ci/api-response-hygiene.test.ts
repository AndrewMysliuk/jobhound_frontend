import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

const SCAN_ROOTS = [join(process.cwd(), "app/api"), join(process.cwd(), "app/store")]

const LEGACY_PATTERNS: Array<{ test: (line: string) => boolean; hint: string }> = [
  {
    test: (line) => /\b(?:response\.data|data)\.code\b/.test(line),
    hint: "legacy root data.code — use error.code from the envelope",
  },
  {
    test: (line) => /\b(?:response\.data|data)\.fieldErrors\b/.test(line),
    hint: "legacy data.fieldErrors — use error.fields from the envelope",
  },
  {
    test: (line) => /typeof\s+[^;\n]*\.error\s*===\s*["']string["']/.test(line),
    hint: "legacy string error — use toApiError(e)",
  },
  {
    test: (line) => {
      if (!/\b(?:response\.data|data)\.error\b/.test(line)) {
        return false
      }

      if (/\b(?:response\.data|data)\.error\./.test(line)) {
        return false
      }

      if (/isRecord\(\s*(?:response\.data|data)\.error\s*\)/.test(line)) {
        return false
      }

      return true
    },
    hint: "legacy string error — read error.code and error.message, not data.error as a string",
  },
  {
    test: (line) => /\b(?:response\.data|data)\.limit\b/.test(line),
    hint: "legacy sibling limit on the error body — use error.meta.limit",
  },
]

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)

    if (statSync(fullPath).isDirectory()) {
      collectSourceFiles(fullPath, files)
      continue
    }

    if (fullPath.endsWith(".ts") && !fullPath.endsWith(".test.ts")) {
      files.push(fullPath)
    }
  }

  return files
}

describe("api response hygiene", () => {
  it("app/api and app/store do not read legacy error shapes", () => {
    const files = SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))
    const violations: string[] = []

    for (const file of files) {
      const lines = readFileSync(file, "utf-8").split("\n")

      lines.forEach((line, index) => {
        if (line.trim().startsWith("//")) {
          return
        }

        for (const { test, hint } of LEGACY_PATTERNS) {
          if (test(line)) {
            violations.push(`${relative(process.cwd(), file)}:${index + 1} — ${hint}`)
          }
        }
      })
    }

    expect(violations).toEqual([])
  })
})
