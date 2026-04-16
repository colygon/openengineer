export const AGENT_NAME_MAP: Record<string, string> = {
  // Architect variants → "architect"
  omo: "architect",
  OmO: "architect",
  Architect: "architect",
  "Architect (Ultraworker)": "architect",
  architect: "architect",

  // Engineer variants → "engineer"
  "Engineer (Deep Agent)": "engineer",

  // ProductManager variants → "product-manager"
  "OmO-Plan": "product-manager",
  "omo-plan": "product-manager",
  "Planner-Architect": "product-manager",
  "planner-architect": "product-manager",
  "ProductManager - Plan Builder": "product-manager",
  "ProductManager (Plan Builder)": "product-manager",
  "product-manager": "product-manager",

  // TechnicalLead variants → "technical-lead"
  "orchestrator-architect": "technical-lead",
  TechnicalLead: "technical-lead",
  "TechnicalLead (Plan Executor)": "technical-lead",
  "technical-lead": "technical-lead",

  // Consultant variants → "consultant"
  "plan-consultant": "consultant",
  "Consultant - Plan Consultant": "consultant",
  "Consultant (Plan Consultant)": "consultant",
  consultant: "consultant",

  // QaEngineer variants → "qa-engineer"
  "QaEngineer - Plan Critic": "qa-engineer",
  "QaEngineer (Plan Critic)": "qa-engineer",
  "qa-engineer": "qa-engineer",

  // Architect-Junior → "junior-architect"
  "Architect-Junior": "junior-architect",
  "junior-architect": "junior-architect",

  // Already lowercase - passthrough
  build: "build",
  strategist: "strategist",
  librarian: "librarian",
  explore: "analyst",
  "designer": "designer",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "architect", // was "Architect"
  "strategist",
  "librarian",
  "analyst",
  "designer",
  "consultant", // was "Consultant - Plan Consultant"
  "qa-engineer", // was "QaEngineer - Plan Critic"
  "product-manager", // was "ProductManager - Plan Builder"
  "technical-lead", // was "TechnicalLead"
  "build",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
