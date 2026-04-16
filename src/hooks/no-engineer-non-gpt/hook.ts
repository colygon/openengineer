import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

const TOAST_TITLE = "NEVER Use Engineer with Non-GPT"
const TOAST_MESSAGE = [
  "Engineer is designed exclusively for GPT models.",
  "Engineer is trash without GPT.",
  "For Claude/Kimi/GLM models, always use Architect.",
].join("\n")
type NoEngineerNonGptHookOptions = {
  allowNonGptModel?: boolean
}

function showToast(ctx: PluginInput, sessionID: string, variant: "error" | "warning"): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant,
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-engineer-non-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoEngineerNonGptHook(
  ctx: PluginInput,
  options?: NoEngineerNonGptHookOptions,
) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getAgentConfigKey(rawAgent)
      const modelID = input.model?.modelID
      const allowNonGptModel = options?.allowNonGptModel === true

      if (agentKey === "engineer" && modelID && !isGptModel(modelID)) {
        showToast(ctx, input.sessionID, allowNonGptModel ? "warning" : "error")
        if (allowNonGptModel) {
          return
        }
        input.agent = resolveRegisteredAgentName("architect") ?? "architect"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("architect") ?? "architect"
        }
        updateSessionAgent(input.sessionID, "architect")
      }
    },
  }
}
