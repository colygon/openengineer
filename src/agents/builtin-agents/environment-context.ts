import type { AgentConfig } from "@opencode-ai/sdk"
import { createEnvContext } from "../env-context"

type ApplyEnvironmentContextOptions = {
  disableEnvContext?: boolean
}

export function applyEnvironmentContext(
  config: AgentConfig,
  directory?: string,
  options: ApplyEnvironmentContextOptions = {}
): AgentConfig {
  if (options.disableEnvContext || !directory || !config.prompt) return config
  const envContext = createEnvContext()
  return { ...config, prompt: config.prompt + envContext }
}
