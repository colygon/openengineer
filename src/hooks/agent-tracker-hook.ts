import { appendFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { calculateCost } from "../features/cost-tracker/pricing-table"
import { log } from "../shared/logger"

interface TokenInfo {
  input: number
  output: number
  reasoning: number
  cache: { read: number; write: number }
}

interface AgentTraceEntry {
  ts: string
  sessionId: string
  parentSessionId?: string
  agent: string
  modelId: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}

export function createAgentTrackerHook(storageDir: string) {
  const traceFile = join(storageDir, "agent-trace.jsonl")
  const sessionParents = new Map<string, string>()

  // Ensure storage dir exists
  if (!existsSync(storageDir)) {
    try { mkdirSync(storageDir, { recursive: true }) } catch {}
  }

  function appendTrace(entry: AgentTraceEntry): void {
    try {
      appendFileSync(traceFile, JSON.stringify(entry) + "\n")
    } catch (err) {
      log("[agent-tracker] Failed to write trace", { error: err })
    }
  }

  const eventHandler = async ({ event }: { event: { type: string; properties?: unknown } }) => {
    const props = event.properties as Record<string, unknown> | undefined

    // Track parent-child session mapping
    if (event.type === "session.created") {
      const info = props?.info as { id?: string; parentID?: string } | undefined
      if (info?.id && info?.parentID) {
        sessionParents.set(info.id, info.parentID)
      }
    }

    // Track agent invocations on assistant message finish
    if (event.type === "message.updated") {
      const info = props?.info as {
        role?: string
        sessionID?: string
        agent?: string
        modelID?: string
        finish?: boolean
        tokens?: TokenInfo
      } | undefined

      if (!info || info.role !== "assistant" || !info.finish) return
      if (!info.sessionID || !info.agent) return

      const modelId = info.modelID ?? ""
      const inputTokens = (info.tokens?.input ?? 0) + (info.tokens?.cache?.read ?? 0)
      const outputTokens = info.tokens?.output ?? 0
      const costUsd = calculateCost(modelId, inputTokens, outputTokens)

      const entry: AgentTraceEntry = {
        ts: new Date().toISOString(),
        sessionId: info.sessionID,
        parentSessionId: sessionParents.get(info.sessionID),
        agent: info.agent,
        modelId,
        inputTokens,
        outputTokens,
        costUsd,
      }

      appendTrace(entry)
    }
  }

  return {
    event: eventHandler,
    traceFile,
  }
}
