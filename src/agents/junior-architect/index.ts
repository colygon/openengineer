export { buildDefaultJuniorArchitectPrompt } from "./default"
export { buildGptJuniorArchitectPrompt } from "./gpt"
export { buildGpt54JuniorArchitectPrompt } from "./gpt-5-4"
export { buildGpt53CodexJuniorArchitectPrompt } from "./gpt-5-3-codex"
export { buildGeminiJuniorArchitectPrompt } from "./gemini"

export {
  JUNIOR_ARCHITECT_DEFAULTS,
  getJuniorArchitectPromptSource,
  buildJuniorArchitectPrompt,
  createJuniorArchitectAgentWithOverrides,
} from "./agent"
export type { JuniorArchitectPromptSource } from "./agent"
