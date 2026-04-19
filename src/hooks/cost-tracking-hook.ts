import { CostTracker } from "../features/cost-tracker"
import { formatCost } from "../features/cost-tracker/pricing-table"
import { log } from "../shared/logger"

interface TokenInfo {
  input: number
  output: number
  reasoning: number
  cache: { read: number; write: number }
}

export function createCostTrackingHook(storageDir: string) {
  const tracker = new CostTracker(storageDir)

  const eventHandler = async ({ event }: { event: { type: string; properties?: unknown } }) => {
    const props = event.properties as Record<string, unknown> | undefined

    if (event.type === "message.updated") {
      const info = props?.info as {
        role?: string
        sessionID?: string
        modelID?: string
        finish?: boolean
        tokens?: TokenInfo
      } | undefined

      if (!info || info.role !== "assistant" || !info.finish) return
      if (!info.sessionID || !info.tokens) return

      const modelId = info.modelID ?? ""
      const inputTokens = (info.tokens.input ?? 0) + (info.tokens.cache?.read ?? 0)
      const outputTokens = info.tokens.output ?? 0

      tracker.recordUsage(info.sessionID, modelId, inputTokens, outputTokens)
    }
  }

  return {
    event: eventHandler,
    tracker,
  }
}
