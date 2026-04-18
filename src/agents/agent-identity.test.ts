/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { buildAgentIdentitySection } from "./dynamic-agent-core-sections"
import { createArchitectAgent } from "./architect"
import { createEngineerAgent } from "./engineer"
import { mergeAgentConfig } from "./builtin-agents/agent-overrides"

describe("buildAgentIdentitySection", () => {
  describe("#given an agent name and role description", () => {
    describe("#when building the identity section", () => {
      it("#then includes the agent name prominently", () => {
        const result = buildAgentIdentitySection("Architect", "Powerful AI orchestrator from Open Engineer")

        expect(result).toContain("Architect")
      })

      it("#then includes the role description", () => {
        const result = buildAgentIdentitySection("Architect", "Powerful AI orchestrator from Open Engineer")

        expect(result).toContain("Powerful AI orchestrator from Open Engineer")
      })

      it("#then wraps content in an identity XML tag", () => {
        const result = buildAgentIdentitySection("Engineer", "Autonomous deep worker")

        expect(result).toContain("<agent-identity>")
        expect(result).toContain("</agent-identity>")
      })

      it("#then explicitly states this identity overrides any prior identity", () => {
        const result = buildAgentIdentitySection("Architect", "Powerful AI orchestrator from Open Engineer")

        expect(result).toMatch(/override|supersede|replace|disregard|instead of/i)
      })
    })
  })

  describe("#given different agent names", () => {
    describe("#when building identity for each", () => {
      it("#then each identity section contains the correct agent name", () => {
        const architect = buildAgentIdentitySection("Architect", "AI orchestrator")
        const engineer = buildAgentIdentitySection("Engineer", "Autonomous deep worker")
        const strategist = buildAgentIdentitySection("Strategist", "Strategic advisor")

        expect(architect).toContain("Architect")
        expect(architect).not.toContain("Engineer")
        expect(engineer).toContain("Engineer")
        expect(engineer).not.toContain("Architect")
        expect(strategist).toContain("Strategist")
      })
    })
  })
})

describe("Architect prompt identity", () => {
  describe("#given a Architect agent created with default model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section with override directive", () => {
        const config = createArchitectAgent("anthropic/claude-opus-4-6")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Architect")
        expect(config.prompt).toContain("</agent-identity>")
      })

      it("#then identity section appears before the Role section", () => {
        const config = createArchitectAgent("anthropic/claude-opus-4-6")
        const prompt = config.prompt ?? ""
        const identityIndex = prompt.indexOf("<agent-identity>")
        const roleIndex = prompt.indexOf("<Role>")

        expect(identityIndex).toBeGreaterThanOrEqual(0)
        expect(roleIndex).toBeGreaterThan(identityIndex)
      })
    })
  })

  describe("#given a Architect agent created with GPT-5.4 model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section", () => {
        const config = createArchitectAgent("openai/gpt-5.4")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Architect")
        expect(config.prompt).toContain("</agent-identity>")
      })
    })
  })
})

describe("Engineer prompt identity", () => {
  describe("#given a Engineer agent created with GPT model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section", () => {
        const config = createEngineerAgent("openai/gpt-5.4")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Engineer")
        expect(config.prompt).toContain("</agent-identity>")
      })

      it("#then identity section appears at the start of the prompt", () => {
        const config = createEngineerAgent("openai/gpt-5.4")
        const prompt = config.prompt ?? ""
        const identityIndex = prompt.indexOf("<agent-identity>")

        expect(identityIndex).toBe(0)
      })
    })
  })
})

describe("Agent identity preservation through overrides", () => {
  describe("#given a Architect agent with prompt_append override", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved in the merged prompt", () => {
        const baseConfig = createArchitectAgent("anthropic/claude-opus-4-6")
        const merged = mergeAgentConfig(baseConfig, { prompt_append: "Extra instructions here" })

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Architect")
        expect(merged.prompt).toContain("</agent-identity>")
        expect(merged.prompt).toContain("Extra instructions here")
      })
    })
  })

  describe("#given a Architect agent with model override only", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved unchanged", () => {
        const baseConfig = createArchitectAgent("anthropic/claude-opus-4-6")
        const merged = mergeAgentConfig(baseConfig, { model: "openai/gpt-5.4" })

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Architect")
        expect(merged.prompt).toContain("</agent-identity>")
      })
    })
  })
})
