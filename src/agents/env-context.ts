/**
 * Creates environment context (timezone, locale) injected into agent prompts.
 * Note: Working directory, platform, and date are already provided by OpenCode's system.ts,
 * so we only include fields that OpenCode doesn't provide to avoid duplication.
 */
export function createEnvContext(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = Intl.DateTimeFormat().resolvedOptions().locale

  return `
<env-context>
  Timezone: ${timezone}
  Locale: ${locale}
</env-context>`
}
