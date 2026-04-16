import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "architect",
  "engineer",
  "product-manager",
  "strategist",
  "librarian",
  "analyst",
  "designer",
  "consultant",
  "qa-engineer",
  "technical-lead",
  "junior-architect",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend-ui-ux",
  "git-master",
  "review-work",
  "ai-slop-remover",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "architect",
  "engineer",
  "junior-architect",
  "OpenCode-Builder",
  "product-manager",
  "consultant",
  "qa-engineer",
  "strategist",
  "librarian",
  "analyst",
  "designer",
  "technical-lead",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
