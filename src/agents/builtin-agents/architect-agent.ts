import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyFallbackModelAvailable } from "../../shared"
import { applyEnvironmentContext } from "./environment-context"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { createArchitectAgent } from "../architect"
import { getGptApplyPatchPermission } from "../gpt-apply-patch-guard"

export function maybeCreateArchitectConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem: boolean
  disableEnvContext?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableEnvContext = false,
  } = input

  const architectOverride = agentOverrides["architect"]
  const architectRequirement = AGENT_MODEL_REQUIREMENTS["architect"]
  const hasArchitectExplicitConfig = architectOverride !== undefined
  const meetsArchitectAnyModelRequirement =
    !architectRequirement?.requiresAnyModel ||
    hasArchitectExplicitConfig ||
    isFirstRunNoCache ||
    isAnyFallbackModelAvailable(architectRequirement.fallbackChain, availableModels)

  if (disabledAgents.includes("architect") || !meetsArchitectAnyModelRequirement) return undefined

  let architectResolution = applyModelResolution({
    uiSelectedModel: architectOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: architectOverride?.model,
    requirement: architectRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !architectOverride?.model && !uiSelectedModel) {
    architectResolution = getFirstFallbackModel(architectRequirement)
  }

  if (!architectResolution) return undefined
  const { model: architectModel, variant: architectResolvedVariant } = architectResolution

  let architectConfig = createArchitectAgent(
    architectModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  if (architectResolvedVariant) {
    architectConfig = { ...architectConfig, variant: architectResolvedVariant }
  }

  architectConfig = applyOverrides(architectConfig, architectOverride, mergedCategories, directory)

  const resolvedModel = architectConfig.model ?? ""
  const gptDeny = getGptApplyPatchPermission(resolvedModel)
  if (Object.keys(gptDeny).length > 0 && architectConfig.permission) {
    Object.assign(architectConfig.permission, gptDeny)
  }

  architectConfig = applyEnvironmentContext(architectConfig, directory, {
    disableEnvContext,
  })

  return architectConfig
}
