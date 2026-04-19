/**
 * Model pricing table for Nebius Token Factory models.
 * Prices are in USD per million tokens.
 * Updated from https://tokenfactory.nebius.com pricing page.
 */

interface ModelPricing {
  input: number   // $/M input tokens
  output: number  // $/M output tokens
}

const NEBIUS_PRICING: Record<string, ModelPricing> = {
  // Qwen
  "Qwen/Qwen3-Coder-480B-A35B-Instruct": { input: 0.4, output: 1.8 },
  "Qwen/Qwen3.5-397B-A17B": { input: 0.6, output: 3.6 },
  "Qwen/Qwen3-235B-A22B-Thinking-2507": { input: 0.2, output: 0.8 },
  "Qwen/Qwen3-235B-A22B-Instruct-2507": { input: 0.2, output: 0.6 },
  "Qwen/Qwen3-Next-80B-A3B-Thinking": { input: 0.15, output: 1.2 },
  "Qwen/Qwen3-32B": { input: 0.1, output: 0.3 },
  "Qwen/Qwen3-30B-A3B-Thinking-2507": { input: 0.1, output: 0.3 },
  "Qwen/Qwen3-30B-A3B-Instruct-2507": { input: 0.1, output: 0.3 },
  "Qwen/Qwen3-Coder-30B-A3B-Instruct": { input: 0.1, output: 0.3 },
  "Qwen/Qwen2.5-VL-72B-Instruct": { input: 0.25, output: 0.75 },
  "Qwen/Qwen2.5-Coder-7B": { input: 0.03, output: 0.09 },

  // Moonshot AI
  "moonshot-ai/Kimi-K2.5": { input: 0.5, output: 2.5 },
  "moonshot-ai/Kimi-K2-Instruct": { input: 0.5, output: 2.4 },
  "moonshot-ai/Kimi-K2-Thinking": { input: 0.6, output: 2.5 },

  // DeepSeek
  "deepseek-ai/DeepSeek-V3.2": { input: 0.3, output: 0.45 },
  "deepseek-ai/DeepSeek-R1-0528": { input: 0.8, output: 2.4 },
  "deepseek-ai/DeepSeek-V3-0324": { input: 0.5, output: 1.5 },

  // Z.ai / GLM
  "zai-org/GLM-5": { input: 1.0, output: 3.2 },
  "zai-org/GLM-4.7": { input: 0.4, output: 2.0 },
  "zai-org/GLM-4.5": { input: 0.6, output: 2.2 },
  "zai-org/GLM-4.5-Air": { input: 0.2, output: 1.2 },

  // NousResearch
  "NousResearch/Hermes-4-405B": { input: 1.0, output: 3.0 },
  "NousResearch/Hermes-4-70B": { input: 0.13, output: 0.4 },

  // OpenAI OSS
  "openai/gpt-oss-120b": { input: 0.15, output: 0.6 },
  "openai/gpt-oss-20b": { input: 0.05, output: 0.2 },

  // NVIDIA
  "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1": { input: 0.6, output: 1.8 },
  "nvidia/Nemotron-3-Super-120b-a12b": { input: 0.3, output: 0.9 },
  "nvidia/Nemotron-Nano-V2-12b": { input: 0.07, output: 0.2 },
  "nvidia/Nemotron-3-Nano-30B-A3B": { input: 0.06, output: 0.24 },

  // MiniMax
  "minimax/MiniMax-M2.5": { input: 0.3, output: 1.2 },
  "minimax/MiniMax-M2.1": { input: 0.3, output: 1.2 },

  // PrimeIntellect
  "PrimeIntellect/INTELLECT-3": { input: 0.2, output: 1.1 },

  // Google
  "google/Gemma-3-27b-it": { input: 0.1, output: 0.3 },
  "google/Gemma-2-9b-it": { input: 0.03, output: 0.09 },

  // Meta
  "meta-llama/Llama-3.3-70B-Instruct": { input: 0.13, output: 0.4 },
  "meta-llama/Meta-Llama-3.1-8B-Instruct": { input: 0.02, output: 0.06 },
}

/**
 * Get pricing for a model ID. Handles `nebius/` prefix stripping.
 * Returns null for unknown models.
 */
export function getModelPricing(modelId: string): ModelPricing | null {
  // Strip provider prefix (e.g., "nebius/Qwen/..." → "Qwen/...")
  const stripped = modelId.replace(/^nebius\//, "")
  return NEBIUS_PRICING[stripped] ?? null
}

/**
 * Calculate cost in dollars for given token counts.
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = getModelPricing(modelId)
  if (!pricing) return 0

  return (inputTokens / 1_000_000) * pricing.input +
         (outputTokens / 1_000_000) * pricing.output
}

/**
 * Format a dollar amount for display.
 */
export function formatCost(dollars: number): string {
  if (dollars < 0.01) return `$${dollars.toFixed(4)}`
  if (dollars < 1) return `$${dollars.toFixed(3)}`
  return `$${dollars.toFixed(2)}`
}
