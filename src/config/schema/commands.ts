import { z } from "zod"

export const BuiltinCommandNameSchema = z.enum([
  "init-deep",
  "auto-loop",
  "ulw-loop",
  "cancel-loop",
  "refactor",
  "start-work",
  "stop-continuation",
  "remove-ai-slops",
])

export type BuiltinCommandName = z.infer<typeof BuiltinCommandNameSchema>
