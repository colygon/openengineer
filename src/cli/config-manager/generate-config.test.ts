/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import { generateConfig } from "../config-manager"
import type { InstallConfig } from "../types"

describe("generateConfig - model fallback system", () => {
  test("uses github-copilot sonnet fallback when only copilot available", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: false,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: true,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect([
      "github-copilot/claude-opus-4.6",
      "github-copilot/claude-opus-4-6",
    ]).toContain((result.agents as Record<string, { model: string }>).openengineer.model)
  })

  test("uses ultimate fallback when no providers configured", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: false,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect(result.$schema).toBe("https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/openengineer.schema.json")
    expect((result.agents as Record<string, { model: string }>).openengineer).toBeUndefined()
  })

  test("uses ZAI model for librarian when Z.ai is available", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: true,
      isMax20: true,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: true,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).librarian.model).toBe("zai-coding-plan/glm-4.7")
    expect((result.agents as Record<string, { model: string }>).openengineer.model).toBe("anthropic/claude-opus-4.6")
  })

  test("uses native OpenAI models when only ChatGPT available", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: false,
      isMax20: false,
      hasOpenAI: true,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string; variant?: string }>).openengineer.model).toBe("openai/gpt-5.4")
    expect((result.agents as Record<string, { model: string; variant?: string }>).openengineer.variant).toBe("medium")
    expect((result.agents as Record<string, { model: string }>).strategist.model).toBe("openai/gpt-5.4")
    expect((result.agents as Record<string, { model: string }>)['designer'].model).toBe("openai/gpt-5.4")
  })

  test("adds fallback_models when multiple providers are available", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: true,
      isMax20: false,
      hasOpenAI: true,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)
    const agents = result.agents as Record<string, {
      model: string
      variant?: string
      fallback_models?: Array<{ model: string; variant?: string }>
    }>
    const categories = result.categories as Record<string, {
      model: string
      variant?: string
      fallback_models?: Array<{ model: string; variant?: string }>
    }>

    //#then
    expect(agents.openengineer.model).toBe("anthropic/claude-opus-4.6")
    expect(agents.openengineer.fallback_models).toEqual([
      {
        model: "openai/gpt-5.4",
        variant: "medium",
      },
    ])
    expect(categories.deep.model).toBe("openai/gpt-5.4")
    expect(categories.deep.fallback_models).toEqual([
      {
        model: "anthropic/claude-opus-4.6",
        variant: "max",
      },
    ])
  })

  test("uses haiku for explore when Claude max20", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: true,
      isMax20: true,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).explore.model).toBe("anthropic/claude-haiku-4-5")
  })

  test("uses haiku for explore regardless of max20 flag", () => {
    //#given
    const config: InstallConfig = {
      hasClaude: true,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).explore.model).toBe("anthropic/claude-haiku-4-5")
  })
})
