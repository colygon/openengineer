import { describe, it, expect } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentConfigKey, getAgentDisplayName, getAgentListDisplayName, normalizeAgentForPrompt, normalizeAgentForPromptKey } from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key (new format)", () => {
    // given config key "architect"
    const configKey = "architect"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Architect - Ultraworker"
    expect(result).toBe("Architect - Ultraworker")
  })

  it("returns display name for uppercase config key (old format - case-insensitive)", () => {
    // given config key "Architect" (old format)
    const configKey = "Architect"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Architect - Ultraworker" (case-insensitive lookup)
    expect(result).toBe("Architect - Ultraworker")
  })

  it("returns original key for unknown agents (fallback)", () => {
    // given config key "custom-agent"
    const configKey = "custom-agent"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent")
  })

  it("returns display name for technical-lead", () => {
    // given config key "technical-lead"
    const configKey = "technical-lead"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "TechnicalLead - Plan Executor"
    expect(result).toBe("TechnicalLead - Plan Executor")
  })

  it("returns display name for product-manager", () => {
    // given config key "product-manager"
    const configKey = "product-manager"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "ProductManager - Plan Builder"
    expect(result).toBe("ProductManager - Plan Builder")
  })

  it("returns display name for junior-architect", () => {
    // given config key "junior-architect"
    const configKey = "junior-architect"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Architect-Junior"
    expect(result).toBe("Architect-Junior")
  })

  it("returns display name for consultant", () => {
    // given config key "consultant"
    const configKey = "consultant"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Consultant - Plan Consultant"
    expect(result).toBe("Consultant - Plan Consultant")
  })

  it("returns display name for qa-engineer", () => {
    // given config key "qa-engineer"
    const configKey = "qa-engineer"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "QaEngineer - Plan Critic"
    expect(result).toBe("QaEngineer - Plan Critic")
  })

  it("returns display name for strategist", () => {
    // given config key "strategist"
    const configKey = "strategist"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "strategist"
    expect(result).toBe("strategist")
  })

  it("returns display name for librarian", () => {
    // given config key "librarian"
    const configKey = "librarian"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "librarian"
    expect(result).toBe("librarian")
  })

  it("returns display name for explore", () => {
    // given config key "analyst"
    const configKey = "analyst"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "analyst"
    expect(result).toBe("analyst")
  })

  it("returns display name for designer", () => {
    // given config key "designer"
    const configKey = "designer"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "designer"
    expect(result).toBe("designer")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves display name to config key", () => {
    // given display name "Architect - Ultraworker"
    // when getAgentConfigKey called
    // then returns "architect"
    expect(getAgentConfigKey("Architect - Ultraworker")).toBe("architect")
  })

  it("resolves display name case-insensitively", () => {
    // given display name in different case
    // when getAgentConfigKey called
    // then returns "technical-lead"
    expect(getAgentConfigKey("technical-lead - plan executor")).toBe("technical-lead")
  })

  it("resolves legacy parenthesized display names", () => {
    // given legacy parenthesized display name from old configs/sessions
    // when getAgentConfigKey called
    // then resolves to canonical config key
    expect(getAgentConfigKey("Architect (Ultraworker)")).toBe("architect")
    expect(getAgentConfigKey("TechnicalLead (Plan Executor)")).toBe("technical-lead")
  })

  it("passes through lowercase config keys unchanged", () => {
    // given lowercase config key "product-manager"
    // when getAgentConfigKey called
    // then returns "product-manager"
    expect(getAgentConfigKey("product-manager")).toBe("product-manager")
  })

  it("returns lowercased unknown agents", () => {
    // given unknown agent name
    // when getAgentConfigKey called
    // then returns lowercased
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
  })

  it("resolves all core agent display names", () => {
    // given all core display names
    // when/then each resolves to its config key
    expect(getAgentConfigKey("Engineer - Deep Agent")).toBe("engineer")
    expect(getAgentConfigKey("ProductManager - Plan Builder")).toBe("product-manager")
    expect(getAgentConfigKey("TechnicalLead - Plan Executor")).toBe("technical-lead")
    expect(getAgentConfigKey("Consultant - Plan Consultant")).toBe("consultant")
    expect(getAgentConfigKey("QaEngineer - Plan Critic")).toBe("qa-engineer")
    expect(getAgentConfigKey("Architect-Junior")).toBe("junior-architect")
  })

  it("resolves technical-lead even when the UI ordering prefix is present", () => {
    expect(getAgentConfigKey(getAgentListDisplayName("technical-lead"))).toBe("technical-lead")
  })

  it("resolves display names even when zero-width characters are embedded", () => {
    expect(getAgentConfigKey("Architect\u200B - Ultraworker")).toBe("architect")
    expect(getAgentConfigKey("\uFEFFTechnicalLead - Plan Executor")).toBe("technical-lead")
  })
})

describe("getAgentListDisplayName", () => {
  it("applies invisible stable-sort prefixes to the core agent list", () => {
    expect(getAgentListDisplayName("architect")).toBe("\u200BArchitect - Ultraworker")
    expect(getAgentListDisplayName("engineer")).toBe("\u200B\u200BEngineer - Deep Agent")
    expect(getAgentListDisplayName("product-manager")).toBe("\u200B\u200B\u200BProductManager - Plan Builder")
    expect(getAgentListDisplayName("technical-lead")).toBe("\u200B\u200B\u200B\u200BTechnicalLead - Plan Executor")
  })

  it("keeps non-core agents unprefixed for list display", () => {
    expect(getAgentListDisplayName("strategist")).toBe("strategist")
  })
})

describe("normalizeAgentForPrompt", () => {
  it("strips core UI ordering prefixes back to canonical display names", () => {
    expect(normalizeAgentForPrompt(getAgentListDisplayName("architect"))).toBe("Architect - Ultraworker")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("engineer"))).toBe("Engineer - Deep Agent")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("product-manager"))).toBe("ProductManager - Plan Builder")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("technical-lead"))).toBe("TechnicalLead - Plan Executor")
  })

  it("removes zero-width characters before returning canonical names", () => {
    expect(normalizeAgentForPrompt("Architect\u200B - Ultraworker")).toBe("Architect - Ultraworker")
  })

  it("converts legacy parenthesized names to canonical display names", () => {
    expect(normalizeAgentForPrompt("TechnicalLead (Plan Executor)")).toBe("TechnicalLead - Plan Executor")
  })
})

describe("normalizeAgentForPromptKey", () => {
  it("converts built-in display names to config keys", () => {
    expect(normalizeAgentForPromptKey("Architect (Ultraworker)")).toBe("architect")
  })

  it("strips UI ordering prefixes before returning config keys", () => {
    expect(normalizeAgentForPromptKey(getAgentListDisplayName("technical-lead"))).toBe("technical-lead")
  })

  it("preserves custom agents", () => {
    expect(normalizeAgentForPromptKey("MyCustomAgent")).toBe("MyCustomAgent")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected agent mappings", () => {
    // given expected mappings
    const expectedMappings = {
      architect: "Architect - Ultraworker",
      engineer: "Engineer - Deep Agent",
      "product-manager": "ProductManager - Plan Builder",
      "technical-lead": "TechnicalLead - Plan Executor",
      "junior-architect": "Architect-Junior",
      consultant: "Consultant - Plan Consultant",
      "qa-engineer": "QaEngineer - Plan Critic",
      athena: "Athena - Council",
      "athena-junior": "Athena-Junior - Council",
      strategist: "strategist",
      librarian: "librarian",
      explore: "analyst",
      "designer": "designer",
      "council-member": "council-member",
    }

    // when checking the constant
    // then contains all expected mappings
    expect(AGENT_DISPLAY_NAMES).toEqual(expectedMappings)
  })

  it("all display names must be HTTP-header-safe (no parentheses)", () => {
    // given all agent display names
    const httpHeaderUnsafe = /[()]/

    // when checking each display name
    for (const [, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
      // then none should contain parentheses
      expect(httpHeaderUnsafe.test(displayName)).toBe(false)
    }
  })
})
