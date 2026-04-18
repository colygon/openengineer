import type { PluginInput } from "@opencode-ai/plugin"
import { getPlanProgress, readPlanState } from "../../features/plan-state"
import type { PlanState, PlanProgress } from "../../features/plan-state"

export async function resolveActiveBoulderSession(input: {
  client: PluginInput["client"]
  directory: string
  sessionID: string
}): Promise<{
  planState: PlanState
  progress: PlanProgress
  appendedSession: boolean
} | null> {
  const planState = readPlanState(input.directory)
  if (!planState) {
    return null
  }

  if (!planState.session_ids.includes(input.sessionID)) {
    return null
  }

  const progress = getPlanProgress(planState.active_plan)
  if (progress.isComplete) {
    return { planState, progress, appendedSession: false }
  }

  return { planState, progress, appendedSession: false }
}
