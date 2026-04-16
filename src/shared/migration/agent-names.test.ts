/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { AGENT_NAME_MAP, migrateAgentNames } from "./agent-names"

describe("AGENT_NAME_MAP parenthesized aliases", () => {
  test("maps Architect (Ultraworker) to architect", () => {
    // given
    const alias = "Architect (Ultraworker)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("architect")
  })

  test("maps Engineer (Deep Agent) to engineer", () => {
    // given
    const alias = "Engineer (Deep Agent)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("engineer")
  })

  test("maps ProductManager (Plan Builder) to product-manager", () => {
    // given
    const alias = "ProductManager (Plan Builder)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("product-manager")
  })

  test("maps TechnicalLead (Plan Executor) to technical-lead", () => {
    // given
    const alias = "TechnicalLead (Plan Executor)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("technical-lead")
  })

  test("maps Consultant (Plan Consultant) to consultant", () => {
    // given
    const alias = "Consultant (Plan Consultant)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("consultant")
  })

  test("maps QaEngineer (Plan Critic) to qa-engineer", () => {
    // given
    const alias = "QaEngineer (Plan Critic)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("qa-engineer")
  })
})

describe("migrateAgentNames with parenthesized aliases", () => {
  test("migrates all parenthesized aliases to canonical names", () => {
    // given
    const legacyAgents = {
      "Architect (Ultraworker)": { model: "claude-opus-4" },
      "Engineer (Deep Agent)": { model: "gpt-5.4" },
      "ProductManager (Plan Builder)": { model: "claude-opus-4" },
      "TechnicalLead (Plan Executor)": { model: "kimi-k2.5" },
      "Consultant (Plan Consultant)": { model: "claude-opus-4" },
      "QaEngineer (Plan Critic)": { model: "claude-opus-4" },
    }

    // when
    const { migrated, changed } = migrateAgentNames(legacyAgents)

    // then
    expect(changed).toBe(true)
    expect(migrated.openengineer).toEqual({ model: "claude-opus-4" })
    expect(migrated.engineer).toEqual({ model: "gpt-5.4" })
    expect(migrated.product-manager).toEqual({ model: "claude-opus-4" })
    expect(migrated.technical-lead).toEqual({ model: "kimi-k2.5" })
    expect(migrated.consultant).toEqual({ model: "claude-opus-4" })
    expect(migrated.qa-engineer).toEqual({ model: "claude-opus-4" })
    expect(migrated["Architect (Ultraworker)"]).toBeUndefined()
    expect(migrated["Engineer (Deep Agent)"]).toBeUndefined()
  })
})
