import { z } from "zod"

export const ArchitectAgentConfigSchema = z.object({
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
  tdd: z.boolean().default(true).optional(),
})

export type ArchitectAgentConfig = z.infer<typeof ArchitectAgentConfigSchema>
