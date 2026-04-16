import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyProviderConnected } from "../../shared"
import { createEngineerAgent } from "../engineer"
import { applyEnvironmentContext } from "./environment-context"
import { applyCategoryOverride, mergeAgentConfig } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { getGptApplyPatchPermission } from "../gpt-apply-patch-guard"

export function maybeCreateEngineerConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv = false,
  } = input

  if (disabledAgents.includes("engineer")) return undefined

  const engineerOverride = agentOverrides["engineer"]
  const engineerRequirement = AGENT_MODEL_REQUIREMENTS["engineer"]
  const hasEngineerExplicitConfig = engineerOverride !== undefined

  const hasRequiredProvider =
    !engineerRequirement?.requiresProvider ||
    hasEngineerExplicitConfig ||
    isFirstRunNoCache ||
    isAnyProviderConnected(engineerRequirement.requiresProvider, availableModels)

  if (!hasRequiredProvider) return undefined

  let engineerResolution = applyModelResolution({
    userModel: engineerOverride?.model,
    requirement: engineerRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !engineerOverride?.model) {
    engineerResolution = getFirstFallbackModel(engineerRequirement)
  }

  if (!engineerResolution) return undefined
  const { model: engineerModel, variant: engineerResolvedVariant } = engineerResolution

  let engineerConfig = createEngineerAgent(
    engineerModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  engineerConfig = { ...engineerConfig, variant: engineerResolvedVariant ?? "medium" }

  const hepOverrideCategory = (engineerOverride as Record<string, unknown> | undefined)?.category as string | undefined
  if (hepOverrideCategory) {
    engineerConfig = applyCategoryOverride(engineerConfig, hepOverrideCategory, mergedCategories)
  }

  engineerConfig = applyEnvironmentContext(engineerConfig, directory, { disableOmoEnv })

  if (engineerOverride) {
    engineerConfig = mergeAgentConfig(engineerConfig, engineerOverride, directory)
  }

  const resolvedModel = engineerConfig.model ?? ""
  const gptDeny = getGptApplyPatchPermission(resolvedModel)
  if (Object.keys(gptDeny).length > 0 && engineerConfig.permission) {
    Object.assign(engineerConfig.permission, gptDeny)
  }

  return engineerConfig
}
