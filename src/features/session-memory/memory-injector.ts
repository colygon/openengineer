import { getMemory } from "./memory-client"
import type { MemoryConfig } from "./memory-client"
import { log } from "../../shared/logger"

/**
 * Creates a chat.message hook that injects relevant memories
 * into the first message of each session.
 */
export function createMemoryInjectorHook(config: MemoryConfig, projectPath?: string) {
  const injectedSessions = new Set<string>()
  const maxInject = config.max_inject ?? 8
  const userId = projectPath ?? "global"

  return {
    "chat.message": async (
      input: { sessionID: string; messages: Array<{ role: string; content: unknown }> },
      output: { messages: Array<{ role: string; content: unknown }> },
    ) => {
      if (config.auto_inject === false) return
      if (injectedSessions.has(input.sessionID)) return

      const memory = getMemory()
      if (!memory) return

      injectedSessions.add(input.sessionID)

      try {
        // Get the user's first message as the search query
        const firstUserMsg = input.messages.find((m) => m.role === "user")
        if (!firstUserMsg) return

        const query =
          typeof firstUserMsg.content === "string"
            ? firstUserMsg.content
            : JSON.stringify(firstUserMsg.content)

        const results = await memory.search(query.slice(0, 500), {
          filters: { user_id: userId },
          topK: maxInject,
          threshold: 0.3,
        })

        const memories = results?.results ?? []
        if (memories.length === 0) return

        const memoryBlock = memories
          .map((m: any) => `- ${m.memory}`)
          .join("\n")

        const injectionText = `<memory-context>
Relevant memories from previous sessions:
${memoryBlock}
</memory-context>`

        // Prepend to the system message or first assistant message
        if (output.messages.length > 0 && output.messages[0].role === "system") {
          const existing = output.messages[0].content
          output.messages[0].content =
            typeof existing === "string"
              ? `${existing}\n\n${injectionText}`
              : existing
        }

        log("[memory-injector] Injected memories", {
          sessionId: input.sessionID,
          count: memories.length,
        })
      } catch (err) {
        log("[memory-injector] Failed to inject memories", { error: err })
      }
    },
  }
}
