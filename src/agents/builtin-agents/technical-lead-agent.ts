import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS } from "../../shared"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution } from "./model-resolution"
import { createTechnicalLeadAgent } from "../technical-lead"

export function maybeCreateTechnicalLeadConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories,
  } = input

  if (disabledAgents.includes("technical-lead")) return undefined

  const orchestratorOverride = agentOverrides["technical-lead"]
  const technicalLeadRequirement = AGENT_MODEL_REQUIREMENTS["technical-lead"]

  const technicalLeadResolution = applyModelResolution({
    uiSelectedModel: orchestratorOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: orchestratorOverride?.model,
    requirement: technicalLeadRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (!technicalLeadResolution) return undefined
  const { model: technicalLeadModel, variant: technicalLeadResolvedVariant } = technicalLeadResolution

  let orchestratorConfig = createTechnicalLeadAgent({
    model: technicalLeadModel,
    availableAgents,
    availableSkills,
    userCategories,
  })

  if (technicalLeadResolvedVariant) {
    orchestratorConfig = { ...orchestratorConfig, variant: technicalLeadResolvedVariant }
  }

  orchestratorConfig = applyOverrides(orchestratorConfig, orchestratorOverride, mergedCategories, directory)

  return orchestratorConfig
}
