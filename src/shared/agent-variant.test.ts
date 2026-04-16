import { describe, expect, test } from "bun:test"
import type { OhMyOpenCodeConfig } from "../config"
import { applyAgentVariant, resolveAgentVariant, resolveVariantForModel } from "./agent-variant"

describe("resolveAgentVariant", () => {
  test("returns undefined when agent name missing", () => {
    // given
    const config = {} as OhMyOpenCodeConfig

    // when
    const variant = resolveAgentVariant(config)

    // then
    expect(variant).toBeUndefined()
  })

  test("returns agent override variant", () => {
    // given
    const config = {
      agents: {
        architect: { variant: "low" },
      },
    } as OhMyOpenCodeConfig

    // when
    const variant = resolveAgentVariant(config, "architect")

    // then
    expect(variant).toBe("low")
  })

  test("returns category variant when agent uses category", () => {
    // given
    const config = {
      agents: {
        architect: { category: "ultrabrain" },
      },
      categories: {
        ultrabrain: { model: "openai/gpt-5.4", variant: "xhigh" },
      },
    } as OhMyOpenCodeConfig

    // when
    const variant = resolveAgentVariant(config, "architect")

    // then
    expect(variant).toBe("xhigh")
  })
})

describe("applyAgentVariant", () => {
  test("sets variant when message is undefined", () => {
    // given
    const config = {
      agents: {
        architect: { variant: "low" },
      },
    } as OhMyOpenCodeConfig
    const message: { variant?: string } = {}

    // when
    applyAgentVariant(config, "architect", message)

    // then
    expect(message.variant).toBe("low")
  })

  test("does not override existing variant", () => {
    // given
    const config = {
      agents: {
        architect: { variant: "low" },
      },
    } as OhMyOpenCodeConfig
    const message = { variant: "max" }

    // when
    applyAgentVariant(config, "architect", message)

    // then
    expect(message.variant).toBe("max")
  })
})

describe("resolveVariantForModel", () => {
  test("returns agent override variant when configured", () => {
    // given - use a model in architect chain (claude-opus-4-6 has default variant "max")
    // to verify override takes precedence over fallback chain
    const config = {
      agents: {
        architect: { variant: "high" },
      },
    } as OhMyOpenCodeConfig
    const model = { providerID: "anthropic", modelID: "claude-opus-4-6" }

    // when
    const variant = resolveVariantForModel(config, "architect", model)

    // then
    expect(variant).toBe("high")
  })

  test("returns correct variant for anthropic provider", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "anthropic", modelID: "claude-opus-4-6" }

    // when
    const variant = resolveVariantForModel(config, "architect", model)

    // then
    expect(variant).toBe("max")
  })

  test("returns correct variant for openai provider (engineer agent)", () => {
    // #given engineer has openai/gpt-5.4 with variant "medium" in its chain
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "openai", modelID: "gpt-5.4" }

    // #when
    const variant = resolveVariantForModel(config, "engineer", model)

    // then
    expect(variant).toBe("medium")
  })

  test("returns medium for openai/gpt-5.4 in architect chain", () => {
    // #given openai/gpt-5.4 is now in architect fallback chain with variant medium
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "openai", modelID: "gpt-5.4" }

    // when
    const variant = resolveVariantForModel(config, "architect", model)

    // then
    expect(variant).toBe("medium")
  })

  test("returns undefined for provider not in chain", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "unknown-provider", modelID: "some-model" }

    // when
    const variant = resolveVariantForModel(config, "architect", model)

    // then
    expect(variant).toBeUndefined()
  })

  test("returns undefined for unknown agent", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "anthropic", modelID: "claude-opus-4-6" }

    // when
    const variant = resolveVariantForModel(config, "nonexistent-agent", model)

    // then
    expect(variant).toBeUndefined()
  })

  test("returns variant for zai-coding-plan provider without variant", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "zai-coding-plan", modelID: "glm-5" }

    // when
    const variant = resolveVariantForModel(config, "architect", model)

    // then
    expect(variant).toBeUndefined()
  })

  test("falls back to category chain when agent has no requirement", () => {
    // given
    const config = {
      agents: {
        "custom-agent": { category: "ultrabrain" },
      },
    } as OhMyOpenCodeConfig
    const model = { providerID: "openai", modelID: "gpt-5.4" }

    // when
    const variant = resolveVariantForModel(config, "custom-agent", model)

    // then
    expect(variant).toBe("xhigh")
  })

  test("returns correct variant for strategist agent with openai", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "openai", modelID: "gpt-5.4" }

    // when
    const variant = resolveVariantForModel(config, "strategist", model)

    // then
    expect(variant).toBe("high")
  })

  test("returns correct variant for strategist agent with anthropic", () => {
    // given
    const config = {} as OhMyOpenCodeConfig
    const model = { providerID: "anthropic", modelID: "claude-opus-4-6" }

    // when
    const variant = resolveVariantForModel(config, "strategist", model)

    // then
    expect(variant).toBe("max")
  })
})
