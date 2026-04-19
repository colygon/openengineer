import { log } from "../../shared/logger"

let Memory: any = null

async function getMemoryClass(): Promise<any> {
  if (!Memory) {
    const mod = await import("mem0ai/oss")
    Memory = mod.Memory
  }
  return Memory
}

export interface MemoryConfig {
  enabled?: boolean
  auto_capture?: boolean
  auto_inject?: boolean
  max_inject?: number
  project_scoped?: boolean
  llm_provider?: string
  llm_model?: string
  llm_base_url?: string
  llm_api_key_env?: string
  embedder_provider?: string
  embedder_model?: string
  embedder_base_url?: string
  embedder_api_key_env?: string
  db_path?: string
}

const DEFAULT_CONFIG: Required<MemoryConfig> = {
  enabled: true,
  auto_capture: true,
  auto_inject: true,
  max_inject: 8,
  project_scoped: true,
  llm_provider: "openai",
  llm_model: "deepseek-ai/DeepSeek-V3.2",
  llm_base_url: "https://api.tokenfactory.us-central1.nebius.com/v1",
  llm_api_key_env: "NEBIUS_API_KEY",
  embedder_provider: "openai",
  embedder_model: "text-embedding-3-small",
  embedder_base_url: "https://api.tokenfactory.us-central1.nebius.com/v1",
  embedder_api_key_env: "NEBIUS_API_KEY",
  db_path: "",
}

let memoryInstance: any = null

/**
 * Initialize the mem0 memory system in local/OSS mode.
 * Uses Nebius Token Factory by default for both LLM and embeddings.
 */
export async function initializeMemory(
  config: MemoryConfig = {},
  storageDir: string,
): Promise<any> {
  if (memoryInstance) return memoryInstance

  const cfg = { ...DEFAULT_CONFIG, ...config }

  if (!cfg.enabled) {
    log("[session-memory] Memory disabled by config")
    return null
  }

  const llmApiKey = process.env[cfg.llm_api_key_env]
  const embedderApiKey = process.env[cfg.embedder_api_key_env]

  if (!llmApiKey) {
    log(`[session-memory] ${cfg.llm_api_key_env} not set, memory disabled`)
    return null
  }

  const dbPath = cfg.db_path || `${storageDir}/memories.db`

  try {
    const MemoryClass = await getMemoryClass()
    memoryInstance = new MemoryClass({
      llm: {
        provider: cfg.llm_provider,
        config: {
          apiKey: llmApiKey,
          model: cfg.llm_model,
          baseURL: cfg.llm_base_url,
        },
      },
      embedder: {
        provider: cfg.embedder_provider,
        config: {
          apiKey: embedderApiKey || llmApiKey,
          model: cfg.embedder_model,
          ...(cfg.embedder_base_url ? { baseURL: cfg.embedder_base_url } : {}),
        },
      },
      vectorStore: {
        provider: "memory",
        config: {
          collectionName: "openengineer-memories",
          dbPath,
        },
      },
      historyStore: {
        provider: "sqlite",
        config: {
          historyDbPath: dbPath,
        },
      },
    })

    log("[session-memory] Memory initialized", { dbPath })
    return memoryInstance
  } catch (err) {
    log("[session-memory] Failed to initialize memory", { error: err })
    return null
  }
}

/**
 * Get the initialized memory instance (or null if not initialized).
 */
export function getMemory(): any {
  return memoryInstance
}
