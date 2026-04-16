import { PRODUCT_MANAGER_IDENTITY_CONSTRAINTS } from "./identity-constraints"
import { PRODUCT_MANAGER_INTERVIEW_MODE } from "./interview-mode"
import { PRODUCT_MANAGER_PLAN_GENERATION } from "./plan-generation"
import { PRODUCT_MANAGER_HIGH_ACCURACY_MODE } from "./high-accuracy-mode"
import { PRODUCT_MANAGER_PLAN_TEMPLATE } from "./plan-template"
import { PRODUCT_MANAGER_BEHAVIORAL_SUMMARY } from "./behavioral-summary"
import { getGptProductManagerPrompt } from "./gpt"
import { getGeminiProductManagerPrompt } from "./gemini"
import { isGptModel, isGeminiModel } from "../types"

/**
 * Combined ProductManager system prompt (Claude-optimized, default).
 * Assembled from modular sections for maintainability.
 */
export const PRODUCT_MANAGER_SYSTEM_PROMPT = `${PRODUCT_MANAGER_IDENTITY_CONSTRAINTS}
${PRODUCT_MANAGER_INTERVIEW_MODE}
${PRODUCT_MANAGER_PLAN_GENERATION}
${PRODUCT_MANAGER_HIGH_ACCURACY_MODE}
${PRODUCT_MANAGER_PLAN_TEMPLATE}
${PRODUCT_MANAGER_BEHAVIORAL_SUMMARY}`

/**
 * ProductManager planner permission configuration.
 * Allows write/edit for plan files (.md only, enforced by productManager-md-only hook).
 * Question permission allows agent to ask user questions via OpenCode's QuestionTool.
 */
export const PRODUCT_MANAGER_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}

export type ProductManagerPromptSource = "default" | "gpt" | "gemini"

/**
 * Determines which ProductManager prompt to use based on model.
 */
export function getProductManagerPromptSource(model?: string): ProductManagerPromptSource {
  if (model && isGptModel(model)) {
    return "gpt"
  }
  if (model && isGeminiModel(model)) {
    return "gemini"
  }
  return "default"
}

/**
 * Gets the appropriate ProductManager prompt based on model.
 * GPT models → GPT-5.4 optimized prompt (XML-tagged, principle-driven)
 * Gemini models → Gemini-optimized prompt (aggressive tool-call enforcement, thinking checkpoints)
 * Default (Claude, etc.) → Claude-optimized prompt (modular sections)
 */
export function getProductManagerPrompt(model?: string, disabledTools?: readonly string[]): string {
  const source = getProductManagerPromptSource(model)
  const isQuestionDisabled = disabledTools?.includes("question") ?? false

  let prompt: string
  switch (source) {
    case "gpt":
      prompt = getGptProductManagerPrompt()
      break
    case "gemini":
      prompt = getGeminiProductManagerPrompt()
      break
    case "default":
    default:
      prompt = PRODUCT_MANAGER_SYSTEM_PROMPT
  }

  if (isQuestionDisabled) {
    prompt = stripQuestionToolReferences(prompt)
  }

  return prompt
}

/**
 * Removes Question tool usage examples from prompt text when question tool is disabled.
 */
function stripQuestionToolReferences(prompt: string): string {
  // Remove Question({...}) code blocks (multi-line)
  return prompt.replace(/```typescript\n\s*Question\(\{[\s\S]*?\}\)\s*\n```/g, "")
}
