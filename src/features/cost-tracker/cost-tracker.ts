import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { calculateCost, formatCost } from "./pricing-table"
import { log } from "../../shared/logger"

interface SessionCost {
  sessionId: string
  modelId: string
  inputTokens: number
  outputTokens: number
  cost: number
  updatedAt: string
}

interface CostData {
  sessions: Record<string, SessionCost>
  lifetimeCost: number
}

export class CostTracker {
  private data: CostData
  private storagePath: string
  private dirty = false

  constructor(storageDir: string) {
    this.storagePath = join(storageDir, "costs.json")
    this.data = this.load()
  }

  private load(): CostData {
    try {
      if (existsSync(this.storagePath)) {
        return JSON.parse(readFileSync(this.storagePath, "utf-8"))
      }
    } catch {
      log("[cost-tracker] Failed to load cost data, starting fresh")
    }
    return { sessions: {}, lifetimeCost: 0 }
  }

  private save(): void {
    if (!this.dirty) return
    try {
      const dir = join(this.storagePath, "..")
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2))
      this.dirty = false
    } catch (err) {
      log("[cost-tracker] Failed to save cost data", { error: err })
    }
  }

  /**
   * Record token usage from a message.updated event.
   */
  recordUsage(
    sessionId: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number,
  ): void {
    const cost = calculateCost(modelId, inputTokens, outputTokens)
    if (cost === 0) return

    const existing = this.data.sessions[sessionId]
    if (existing) {
      existing.inputTokens += inputTokens
      existing.outputTokens += outputTokens
      existing.cost += cost
      existing.modelId = modelId
      existing.updatedAt = new Date().toISOString()
    } else {
      this.data.sessions[sessionId] = {
        sessionId,
        modelId,
        inputTokens,
        outputTokens,
        cost,
        updatedAt: new Date().toISOString(),
      }
    }

    this.data.lifetimeCost += cost
    this.dirty = true

    // Debounced save — don't write on every token event
    this.scheduleSave()
  }

  private saveTimer: ReturnType<typeof setTimeout> | null = null

  private scheduleSave(): void {
    if (this.saveTimer) return
    this.saveTimer = setTimeout(() => {
      this.save()
      this.saveTimer = null
    }, 5000)
  }

  /**
   * Get cost for a specific session.
   */
  getSessionCost(sessionId: string): number {
    return this.data.sessions[sessionId]?.cost ?? 0
  }

  /**
   * Get lifetime cost across all sessions.
   */
  getLifetimeCost(): number {
    return this.data.lifetimeCost
  }

  /**
   * Get formatted cost summary for display.
   */
  getCostSummary(sessionId: string): string {
    const session = formatCost(this.getSessionCost(sessionId))
    const lifetime = formatCost(this.getLifetimeCost())
    return `${session} (session) · ${lifetime} (lifetime)`
  }

  /**
   * Flush pending writes to disk.
   */
  flush(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    this.save()
  }
}
