/**
 * Architect-Junior - Focused Task Executor
 *
 * Executes delegated tasks directly without spawning other agents.
 * Category-spawned executor with domain-specific configurations.
 *
 * Routing:
 * 1. GPT models (openai/*, github-copilot/gpt-*) -> gpt.ts (GPT-5.4 optimized)
 * 2. Gemini models (google/*, google-vertex/*) -> gemini.ts (Gemini-optimized)
 * 3. Default (Claude, etc.) -> default.ts (Claude-optimized)
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode } from "../types"
import { isGlmModel, isGptModel, isGeminiModel } from "../types"
import type { AgentOverrideConfig } from "../../config/schema"
import {
  createAgentToolRestrictions,
  type PermissionValue,
} from "../../shared/permission-compat"
import { getGptApplyPatchPermission } from "../gpt-apply-patch-guard"

import { buildDefaultJuniorArchitectPrompt } from "./default"
import { buildGptJuniorArchitectPrompt } from "./gpt"
import { buildGpt54JuniorArchitectPrompt } from "./gpt-5-4"
import { buildGpt53CodexJuniorArchitectPrompt } from "./gpt-5-3-codex"
import { buildGeminiJuniorArchitectPrompt } from "./gemini"

const MODE: AgentMode = "subagent"

// Core tools that Architect-Junior must NEVER have access to
// Note: call_agent is ALLOWED so subagents can spawn explore/librarian
const BLOCKED_TOOLS = ["task"]
const GPT_BLOCKED_TOOLS = ["task", "apply_patch"]

export const JUNIOR_ARCHITECT_DEFAULTS = {
  model: "anthropic/claude-sonnet-4-6",
  temperature: 0.1,
} as const

export type JuniorArchitectPromptSource = "default" | "gpt" | "gpt-5-4" | "gpt-5-3-codex" | "gemini"

export function getJuniorArchitectPromptSource(model?: string): JuniorArchitectPromptSource {
  if (model && isGptModel(model)) {
    const lower = model.toLowerCase()
    if (lower.includes("gpt-5.4") || lower.includes("gpt-5-4")) return "gpt-5-4"
    if (lower.includes("gpt-5.3-codex") || lower.includes("gpt-5-3-codex")) return "gpt-5-3-codex"
    return "gpt"
  }
  if (model && isGeminiModel(model)) {
    return "gemini"
  }
  return "default"
}

/**
 * Builds the appropriate Architect-Junior prompt based on model.
 */
export function buildJuniorArchitectPrompt(
  model: string | undefined,
  useTaskSystem: boolean,
  promptAppend?: string
): string {
  const source = getJuniorArchitectPromptSource(model)

  switch (source) {
    case "gpt-5-4":
      return buildGpt54JuniorArchitectPrompt(useTaskSystem, promptAppend)
    case "gpt-5-3-codex":
      return buildGpt53CodexJuniorArchitectPrompt(useTaskSystem, promptAppend)
    case "gpt":
      return buildGptJuniorArchitectPrompt(useTaskSystem, promptAppend)
    case "gemini":
      return buildGeminiJuniorArchitectPrompt(useTaskSystem, promptAppend)
    case "default":
    default:
      return buildDefaultJuniorArchitectPrompt(useTaskSystem, promptAppend)
  }
}

export function createJuniorArchitectAgentWithOverrides(
  override: AgentOverrideConfig | undefined,
  systemDefaultModel?: string,
  useTaskSystem = false
): AgentConfig {
  if (override?.disable) {
    override = undefined
  }

  const overrideModel = (override as { model?: string } | undefined)?.model
  const model = overrideModel ?? systemDefaultModel ?? JUNIOR_ARCHITECT_DEFAULTS.model
  const temperature = override?.temperature ?? JUNIOR_ARCHITECT_DEFAULTS.temperature

  const promptAppend = override?.prompt_append
  const prompt = buildJuniorArchitectPrompt(model, useTaskSystem, promptAppend)
  const blockedTools = isGptModel(model) ? GPT_BLOCKED_TOOLS : BLOCKED_TOOLS

  const baseRestrictions = createAgentToolRestrictions(blockedTools)

  const userPermission = (override?.permission ?? {}) as Record<string, PermissionValue>
  const basePermission = baseRestrictions.permission
  const merged: Record<string, PermissionValue> = { ...userPermission }
  for (const tool of blockedTools) {
    merged[tool] = "deny"
  }
  merged.call_agent = "allow"
  const toolsConfig = { permission: { ...merged, ...basePermission } as Record<string, PermissionValue> }
  const permission: Record<string, PermissionValue> = {
    ...toolsConfig.permission,
    ...getGptApplyPatchPermission(model),
  }

  const base: AgentConfig = {
    description: override?.description ??
      "Focused task executor. Same discipline, no delegation. (Architect-Junior - Open Engineer)",
    mode: MODE,
    model,
    temperature,
    maxTokens: 64000,
    prompt,
    color: override?.color ?? "#20B2AA",
    permission,
  }

  if (override?.top_p !== undefined) {
    base.top_p = override.top_p
  }

  if (isGptModel(model)) {
    return { ...base, reasoningEffort: "medium" } as AgentConfig
  }

  if (isGlmModel(model)) {
    return base as AgentConfig
  }

  return {
    ...base,
    thinking: { type: "enabled", budgetTokens: 32000 },
  } as AgentConfig
}

createJuniorArchitectAgentWithOverrides.mode = MODE
