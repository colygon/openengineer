export type FallbackEntry = {
  providers: string[];
  model: string;
  variant?: string; // Entry-specific variant (e.g., GPT→high, Opus→max)
  reasoningEffort?: string;
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  thinking?: { type: "enabled" | "disabled"; budgetTokens?: number };
};

export type ModelRequirement = {
  fallbackChain: FallbackEntry[];
  variant?: string; // Default variant (used when entry doesn't specify one)
  requiresModel?: string; // If set, only activates when this model is available (fuzzy match)
  requiresAnyModel?: boolean; // If true, requires at least ONE model in fallbackChain to be available (or empty availability treated as unavailable)
  requiresProvider?: string[]; // If set, only activates when any of these providers is connected
};

/**
 * Open Engineer agent model requirements - all using open-source models via Nebius/Token Factory
 * Diverse model selection across 12 makers for maximum resilience and capability coverage
 */
export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  architect: {
    fallbackChain: [
      { providers: ["nebius"], model: "Qwen/Qwen3-Coder-480B-A35B-Instruct" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
      { providers: ["nebius"], model: "zai-org/GLM-4.5" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
    ],
    requiresAnyModel: true,
  },
  engineer: {
    fallbackChain: [
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "meta-llama/Llama-3.3-70B-Instruct" },
      { providers: ["nebius"], model: "Qwen/Qwen3-Coder-480B-A35B-Instruct" },
      { providers: ["nebius"], model: "openai/gpt-oss-120b" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2-Instruct" },
    ],
  },
  strategist: {
    fallbackChain: [
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "Qwen/Qwen3-235B-A22B-Thinking-2507" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2-Thinking" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "zai-org/GLM-4.7" },
    ],
  },
  librarian: {
    fallbackChain: [
      { providers: ["nebius"], model: "Qwen/Qwen3-30B-A3B-Instruct-2507" },
      { providers: ["nebius"], model: "google/Gemma-3-27b-it" },
      { providers: ["nebius"], model: "nvidia/Nemotron-3-Nano-30B-A3B" },
    ],
  },
  analyst: {
    fallbackChain: [
      { providers: ["nebius"], model: "openai/gpt-oss-20b" },
      { providers: ["nebius"], model: "Qwen/Qwen3-Next-80B-A3B-Thinking" },
      { providers: ["nebius"], model: "google/Gemma-3-27b-it" },
      { providers: ["nebius"], model: "nvidia/Nemotron-Nano-V2-12b" },
    ],
  },
  "designer": {
    fallbackChain: [
      { providers: ["nebius"], model: "Qwen/Qwen2.5-VL-72B-Instruct" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "zai-org/GLM-4.5-Air" },
      { providers: ["nebius"], model: "minimax/MiniMax-M2.5" },
    ],
  },
  "product-manager": {
    fallbackChain: [
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
      { providers: ["nebius"], model: "Qwen/Qwen3.5-397B-A17B" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "zai-org/GLM-5" },
    ],
  },
  consultant: {
    fallbackChain: [
      { providers: ["nebius"], model: "zai-org/GLM-5" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "Qwen/Qwen3.5-397B-A17B" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
    ],
  },
  "qa-engineer": {
    fallbackChain: [
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "Qwen/Qwen3-235B-A22B-Thinking-2507" },
      { providers: ["nebius"], model: "zai-org/GLM-4.5" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2-Thinking" },
    ],
  },
  "technical-lead": {
    fallbackChain: [
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2-Instruct" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "openai/gpt-oss-120b" },
      { providers: ["nebius"], model: "Qwen/Qwen3-235B-A22B-Instruct-2507" },
      { providers: ["nebius"], model: "zai-org/GLM-4.7" },
    ],
  },
  "junior-architect": {
    fallbackChain: [
      { providers: ["nebius"], model: "openai/gpt-oss-120b" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "PrimeIntellect/INTELLECT-3" },
      { providers: ["nebius"], model: "google/Gemma-3-27b-it" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-70B" },
    ],
  },
};

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      { providers: ["nebius"], model: "Qwen/Qwen2.5-VL-72B-Instruct" },
      { providers: ["nebius"], model: "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "Qwen/Qwen3-235B-A22B-Thinking-2507" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2-Thinking" },
      { providers: ["nebius"], model: "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1" },
      { providers: ["nebius"], model: "zai-org/GLM-5" },
    ],
  },
  deep: {
    fallbackChain: [
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
      { providers: ["nebius"], model: "Qwen/Qwen3-Coder-480B-A35B-Instruct" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "zai-org/GLM-5" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
    ],
  },
  artistry: {
    fallbackChain: [
      { providers: ["nebius"], model: "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1" },
      { providers: ["nebius"], model: "minimax/MiniMax-M2.5" },
      { providers: ["nebius"], model: "zai-org/GLM-4.5" },
      { providers: ["nebius"], model: "moonshot-ai/Kimi-K2.5" },
    ],
  },
  quick: {
    fallbackChain: [
      { providers: ["nebius"], model: "google/Gemma-3-27b-it" },
      { providers: ["nebius"], model: "openai/gpt-oss-20b" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-70B" },
      { providers: ["nebius"], model: "nvidia/Nemotron-3-Nano-30B-A3B" },
      { providers: ["nebius"], model: "Qwen/Qwen3-30B-A3B-Instruct-2507" },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      { providers: ["nebius"], model: "meta-llama/Llama-3.3-70B-Instruct" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "openai/gpt-oss-120b" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-70B" },
      { providers: ["nebius"], model: "google/Gemma-3-27b-it" },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      { providers: ["nebius"], model: "Qwen/Qwen3.5-397B-A17B" },
      { providers: ["nebius"], model: "Qwen/Qwen3-Coder-480B-A35B-Instruct" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-R1-0528" },
      { providers: ["nebius"], model: "NousResearch/Hermes-4-405B" },
      { providers: ["nebius"], model: "zai-org/GLM-5" },
    ],
  },
  writing: {
    fallbackChain: [
      { providers: ["nebius"], model: "PrimeIntellect/INTELLECT-3" },
      { providers: ["nebius"], model: "minimax/MiniMax-M2.5" },
      { providers: ["nebius"], model: "deepseek-ai/DeepSeek-V3.2" },
      { providers: ["nebius"], model: "zai-org/GLM-4.5-Air" },
    ],
  },
};
