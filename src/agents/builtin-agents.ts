import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"
import type { CategoriesConfig, GitMasterConfig } from "../config/schema"
import type { LoadedSkill } from "../features/opencode-skill-loader/types"
import type { BrowserAutomationProvider } from "../config/schema"
import { createArchitectAgent } from "./architect"
import { createStrategistAgent, STRATEGIST_PROMPT_METADATA } from "./strategist"
import { createLibrarianAgent, LIBRARIAN_PROMPT_METADATA } from "./librarian"
import { createAnalystAgent, ANALYST_PROMPT_METADATA } from "./analyst"
import { createDesignerAgent, DESIGNER_PROMPT_METADATA } from "./designer"
import { createConsultantAgent, consultantPromptMetadata } from "./consultant"
import { createTechnicalLeadAgent, technicalLeadPromptMetadata } from "./technical-lead"
import { createQaEngineerAgent, qaEngineerPromptMetadata } from "./qa-engineer"
import { createEngineerAgent } from "./engineer"
import { createJuniorArchitectAgentWithOverrides } from "./junior-architect"
import type { AvailableCategory } from "./dynamic-agent-prompt-builder"
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  readProviderModelsCache,
} from "../shared"
import { CATEGORY_DESCRIPTIONS } from "../tools/delegate-task/constants"
import { mergeCategories } from "../shared/merge-categories"
import { buildAvailableSkills } from "./builtin-agents/available-skills"
import { collectPendingBuiltinAgents } from "./builtin-agents/general-agents"
import { maybeCreateArchitectConfig } from "./builtin-agents/architect-agent"
import { maybeCreateEngineerConfig } from "./builtin-agents/engineer-agent"
import { maybeCreateTechnicalLeadConfig } from "./builtin-agents/technical-lead-agent"

type AgentSource = AgentFactory | AgentConfig

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  architect: createArchitectAgent,
  engineer: createEngineerAgent,
  strategist: createStrategistAgent,
  librarian: createLibrarianAgent,
  analyst: createAnalystAgent,
  "designer": createDesignerAgent,
  consultant: createConsultantAgent,
  "qa-engineer": createQaEngineerAgent,
  // Note: TechnicalLead is handled specially in createBuiltinAgents()
  // because it needs OrchestratorContext, not just a model string
  "technical-lead": createTechnicalLeadAgent as AgentFactory,
  "junior-architect": createJuniorArchitectAgentWithOverrides as unknown as AgentFactory,
}

/**
 * Metadata for each agent, used to build Architect's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  strategist: STRATEGIST_PROMPT_METADATA,
  librarian: LIBRARIAN_PROMPT_METADATA,
  analyst: ANALYST_PROMPT_METADATA,
  "designer": DESIGNER_PROMPT_METADATA,
  consultant: consultantPromptMetadata,
  "qa-engineer": qaEngineerPromptMetadata,
  "technical-lead": technicalLeadPromptMetadata,
}

export async function createBuiltinAgents(
  disabledAgents: string[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  discoveredSkills: LoadedSkill[] = [],
  customAgentSummaries?: unknown,
  browserProvider?: BrowserAutomationProvider,
  uiSelectedModel?: string,
  disabledSkills?: Set<string>,
  useTaskSystem = false,
  disableEnvContext = false
): Promise<Record<string, AgentConfig>> {

  const connectedProviders = readConnectedProvidersCache()
  const providerModelsConnected = connectedProviders
    ? (readProviderModelsCache()?.connected ?? [])
    : []
  const mergedConnectedProviders = Array.from(
    new Set([...(connectedProviders ?? []), ...providerModelsConnected])
  )
  // IMPORTANT: Do NOT call OpenCode client APIs during plugin initialization.
  // This function is called from config handler, and calling client API causes deadlock.
  // See: https://github.com/code-yeongyu/oh-my-openagent/issues/1301
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: mergedConnectedProviders.length > 0 ? mergedConnectedProviders : undefined,
  })
  const isFirstRunNoCache =
    availableModels.size === 0 && mergedConnectedProviders.length === 0

  const result: Record<string, AgentConfig> = {}

  const mergedCategories = mergeCategories(categories)

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(([name]) => ({
    name,
    description: categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
  }))

  const availableSkills = buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills)

  // Collect general agents first (for availableAgents), but don't add to result yet
  const { pendingAgentConfigs, availableAgents } = collectPendingBuiltinAgents({
    agentSources,
    agentMetadata,
    disabledAgents,
    agentOverrides,
    directory,
    systemDefaultModel,
    mergedCategories,
    gitMasterConfig,
    browserProvider,
    uiSelectedModel,
    availableModels,
    isFirstRunNoCache,
    disabledSkills,
    disableEnvContext,
  })

  const architectConfig = maybeCreateArchitectConfig({
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
    userCategories: categories,
    useTaskSystem,
    disableEnvContext,
  })
  if (architectConfig) {
    result["architect"] = architectConfig
  }

  const engineerConfig = maybeCreateEngineerConfig({
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
    disableEnvContext,
  })
  if (engineerConfig) {
    result["engineer"] = engineerConfig
  }

  // Add pending agents after architect and engineer to maintain order
  for (const [name, config] of pendingAgentConfigs) {
    result[name] = config
  }

  const technicalLeadConfig = maybeCreateTechnicalLeadConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories: categories,
  })
  if (technicalLeadConfig) {
    result["technical-lead"] = technicalLeadConfig
  }

  return result
}
