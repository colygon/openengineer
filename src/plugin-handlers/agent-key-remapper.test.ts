import { describe, it, expect } from "bun:test"
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper"
import { getAgentDisplayName, getAgentListDisplayName, getAgentRuntimeName } from "../shared/agent-display-names"

describe("remapAgentKeysToDisplayNames", () => {
  it("remaps known agent keys to display names", () => {
    // given agents with lowercase keys
    const agents = {
      architect: { prompt: "test", mode: "primary" },
      strategist: { prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then known agents get display name keys only
    expect(result[getAgentListDisplayName("architect")]).toBeDefined()
    expect(result["strategist"]).toBeDefined()
    expect(result["architect"]).toBeUndefined()
  })

  it("preserves unknown agent keys unchanged", () => {
    // given agents with a custom key
    const agents = {
      "custom-agent": { prompt: "custom" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then custom key is unchanged
    expect(result["custom-agent"]).toBeDefined()
  })

  it("remaps all core agents to display names", () => {
    // given all core agents
    const agents = {
      architect: {},
      engineer: {},
      "product-manager": {},
      "technical-lead": {},
      athena: {},
      consultant: {},
      "qa-engineer": {},
      "junior-architect": {},
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then all get display name keys
    expect(result[getAgentListDisplayName("architect")]).toBeDefined()
    expect(result["architect"]).toBeUndefined()
    expect(result[getAgentListDisplayName("engineer")]).toBeDefined()
    expect(result["engineer"]).toBeUndefined()
    expect(result[getAgentListDisplayName("product-manager")]).toBeDefined()
    expect(result["product-manager"]).toBeUndefined()
    expect(result[getAgentListDisplayName("technical-lead")]).toBeDefined()
    expect(result["technical-lead"]).toBeUndefined()
    expect(result[getAgentDisplayName("athena")]).toBeDefined()
    expect(result["athena"]).toBeUndefined()
    expect(result[getAgentDisplayName("consultant")]).toBeDefined()
    expect(result["consultant"]).toBeUndefined()
    expect(result[getAgentDisplayName("qa-engineer")]).toBeDefined()
    expect(result["qa-engineer"]).toBeUndefined()
    expect(result[getAgentDisplayName("junior-architect")]).toBeDefined()
    expect(result["junior-architect"]).toBeUndefined()
  })

  it("does not emit both config and display keys for remapped agents", () => {
    // given one remapped agent
    const agents = {
      architect: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then only display key is emitted
    expect(Object.keys(result)).toEqual([getAgentListDisplayName("architect")])
    expect(result[getAgentListDisplayName("architect")]).toBeDefined()
    expect(result["architect"]).toBeUndefined()
  })

  it("returns runtime core agent list names in canonical order", () => {
    // given
    const result = remapAgentKeysToDisplayNames({
      "technical-lead": {},
      "product-manager": {},
      engineer: {},
      architect: {},
    })

    // when
    const remappedNames = Object.keys(result)

    // then
    expect(remappedNames).toEqual([
      getAgentListDisplayName("technical-lead"),
      getAgentListDisplayName("product-manager"),
      getAgentListDisplayName("engineer"),
      getAgentListDisplayName("architect"),
    ])
  })

  it("keeps remapped core agent name fields aligned with OpenCode list ordering", () => {
    // given agents with raw config-key names
    const agents = {
      architect: { name: "architect", prompt: "test", mode: "primary" },
      engineer: { name: "engineer", prompt: "test", mode: "primary" },
      "product-manager": { name: "product-manager", prompt: "test", mode: "primary" },
      "technical-lead": { name: "technical-lead", prompt: "test", mode: "primary" },
      strategist: { name: "strategist", prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then keys and names both use the same runtime-facing list names
    expect(Object.keys(result).slice(0, 4)).toEqual([
      getAgentListDisplayName("architect"),
      getAgentListDisplayName("engineer"),
      getAgentListDisplayName("product-manager"),
      getAgentListDisplayName("technical-lead"),
    ])
    expect(result[getAgentListDisplayName("architect")]).toEqual({
      name: getAgentRuntimeName("architect"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("engineer")]).toEqual({
      name: getAgentRuntimeName("engineer"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("product-manager")]).toEqual({
      name: getAgentRuntimeName("product-manager"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("technical-lead")]).toEqual({
      name: getAgentRuntimeName("technical-lead"),
      prompt: "test",
      mode: "primary",
    })
    expect(result.strategist).toEqual({ name: "strategist", prompt: "test", mode: "subagent" })
  })

  it("backfills runtime names for core agents when builtin configs omit name", () => {
    // given builtin-style configs without name fields
    const agents = {
      architect: { prompt: "test", mode: "primary" },
      engineer: { prompt: "test", mode: "primary" },
      "product-manager": { prompt: "test", mode: "primary" },
      "technical-lead": { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then runtime-facing names stay aligned even when builtin configs omit name
    expect(result[getAgentListDisplayName("architect")]).toEqual({
      name: getAgentRuntimeName("architect"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("engineer")]).toEqual({
      name: getAgentRuntimeName("engineer"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("product-manager")]).toEqual({
      name: getAgentRuntimeName("product-manager"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("technical-lead")]).toEqual({
      name: getAgentRuntimeName("technical-lead"),
      prompt: "test",
      mode: "primary",
    })
  })
})
