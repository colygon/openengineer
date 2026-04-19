import { tool } from "@opencode-ai/plugin"
import { getMemory } from "./memory-client"
import { log } from "../../shared/logger"

/**
 * Creates the `remember` tool for agents to store and retrieve persistent memories.
 */
export function createRememberTool(projectPath?: string): ReturnType<typeof tool> {
  const userId = projectPath ?? "global"

  return tool({
    description:
      "Store, search, or list memories that persist across sessions. " +
      "Use this to remember important facts, decisions, user preferences, " +
      "codebase patterns, or anything worth recalling in future sessions.",
    args: {
      action: tool.schema
        .enum(["add", "search", "list", "delete"])
        .describe("Action to perform: add a memory, search for relevant ones, list all, or delete by ID"),
      content: tool.schema
        .string()
        .optional()
        .describe("For 'add': the fact/memory to store. For 'search': the query to find relevant memories."),
      tags: tool.schema
        .string()
        .optional()
        .describe("Comma-separated tags to categorize the memory (for 'add') or filter (for 'list')"),
      id: tool.schema
        .string()
        .optional()
        .describe("Memory ID (for 'delete' action)"),
      limit: tool.schema
        .number()
        .optional()
        .describe("Max results to return (default: 5)"),
    },
    async execute(args, _context) {
      const memory = getMemory()
      if (!memory) {
        return "Memory system is not initialized. Set NEBIUS_API_KEY to enable."
      }

      const { action, content, tags, id } = args
      const limit = args.limit ?? 5

      try {
        switch (action) {
          case "add": {
            if (!content) return "Error: 'content' is required for add action"
            const result = await memory.add(content, {
              userId,
              metadata: {
                tags: tags ?? "",
                project: projectPath ?? "global",
                timestamp: new Date().toISOString(),
              },
            })
            const count = result?.results?.length ?? 0
            return `Stored ${count} memory/memories successfully.`
          }

          case "search": {
            if (!content) return "Error: 'content' is required for search action"
            const results = await memory.search(content, {
              filters: { user_id: userId },
              topK: limit,
            })
            const memories = results?.results ?? []
            if (memories.length === 0) return "No relevant memories found."
            return memories
              .map((m: any, i: number) =>
                `${i + 1}. [${m.id?.slice(0, 8)}] (score: ${m.score?.toFixed(2) ?? "?"}) ${m.memory}`
              )
              .join("\n")
          }

          case "list": {
            const results = await memory.getAll({
              filters: { user_id: userId },
              topK: limit,
            })
            const memories = results?.results ?? []
            if (memories.length === 0) return "No memories stored yet."
            return memories
              .map((m: any, i: number) => `${i + 1}. [${m.id?.slice(0, 8)}] ${m.memory}`)
              .join("\n")
          }

          case "delete": {
            if (!id) return "Error: 'id' is required for delete action"
            await memory.delete(id)
            return `Memory ${id} deleted.`
          }

          default:
            return `Unknown action: ${action}. Use add, search, list, or delete.`
        }
      } catch (err) {
        log("[remember-tool] Error", { action, error: err })
        return `Memory operation failed: ${err instanceof Error ? err.message : String(err)}`
      }
    },
  })
}
