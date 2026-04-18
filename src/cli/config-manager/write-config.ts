import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, extname, join } from "node:path"

import { parseJsonc } from "../../shared"
import { migrateLegacyConfigFile } from "../../shared/migrate-legacy-config-file"
import { CONFIG_BASENAME, LEGACY_CONFIG_BASENAME } from "../../shared/plugin-identity"
import type { ConfigMergeResult, InstallConfig } from "../types"
import { backupConfigFile } from "./backup-config"
import { getConfigDir, getConfigPath } from "./config-context"
import { deepMergeRecord } from "./deep-merge-record"
import { ensureConfigDirectoryExists } from "./ensure-config-directory-exists"
import { formatErrorWithSuggestion } from "./format-error-with-suggestion"
import { generateConfig } from "./generate-config"

function isEmptyOrWhitespace(content: string): boolean {
  return content.trim().length === 0
}

export function writeConfig(installConfig: InstallConfig): ConfigMergeResult {
  try {
    ensureConfigDirectoryExists()
  } catch (err) {
    return {
      success: false,
      configPath: getConfigDir(),
      error: formatErrorWithSuggestion(err, "create config directory"),
    }
  }

  const detectedConfigPath = getConfigPath()
  const canonicalConfigPath = join(dirname(detectedConfigPath), `${CONFIG_BASENAME}${extname(detectedConfigPath) || ".json"}`)
  const shouldMigrateLegacyPath = basename(detectedConfigPath).startsWith(LEGACY_CONFIG_BASENAME)
  const omoConfigPath = shouldMigrateLegacyPath
    ? ((migrateLegacyConfigFile(detectedConfigPath) || existsSync(canonicalConfigPath))
        ? canonicalConfigPath
        : detectedConfigPath)
    : detectedConfigPath

  try {
    const newConfig = generateConfig(installConfig)

    if (existsSync(omoConfigPath)) {
      const backupResult = backupConfigFile(omoConfigPath)
      if (!backupResult.success) {
        return {
          success: false,
          configPath: omoConfigPath,
          error: `Failed to create backup: ${backupResult.error}`,
        }
      }

      try {
        const stat = statSync(omoConfigPath)
        const content = readFileSync(omoConfigPath, "utf-8")

        if (stat.size === 0 || isEmptyOrWhitespace(content)) {
          writeFileSync(omoConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: omoConfigPath }
        }

        const existing = parseJsonc<Record<string, unknown>>(content)
        if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
          writeFileSync(omoConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: omoConfigPath }
        }

        const merged = deepMergeRecord(newConfig, existing)
        writeFileSync(omoConfigPath, JSON.stringify(merged, null, 2) + "\n")
      } catch (parseErr) {
        if (parseErr instanceof SyntaxError) {
          writeFileSync(omoConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: omoConfigPath }
        }
        throw parseErr
      }
    } else {
      writeFileSync(omoConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
    }

    return { success: true, configPath: omoConfigPath }
  } catch (err) {
    return {
      success: false,
      configPath: omoConfigPath,
      error: formatErrorWithSuggestion(err, `write ${CONFIG_BASENAME} config`),
    }
  }
}
