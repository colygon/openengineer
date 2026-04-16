import { describe, expect, test } from "bun:test"
import {
  AGENT_MODEL_REQUIREMENTS,
  CATEGORY_MODEL_REQUIREMENTS,
  type FallbackEntry,
  type ModelRequirement,
} from "./model-requirements"

describe("AGENT_MODEL_REQUIREMENTS", () => {
  test("strategist has valid fallbackChain with gpt-5.4 as primary", () => {
    // given - strategist agent requirement
    const strategist = AGENT_MODEL_REQUIREMENTS["strategist"]

    // when - accessing strategist requirement
    // then - fallbackChain exists with gpt-5.4 as first entry
    expect(strategist).toBeDefined()
    expect(strategist.fallbackChain).toBeArray()
    expect(strategist.fallbackChain.length).toBeGreaterThan(0)

    const primary = strategist.fallbackChain[0]
    expect(primary.providers).toContain("openai")
    expect(primary.model).toBe("gpt-5.4")
    expect(primary.variant).toBe("high")
  })

  test("architect has claude-opus-4-6 as primary with k2p5, kimi-k2.5, gpt-5.4 medium fallbacks", () => {
    // #given - architect agent requirement
    const architect = AGENT_MODEL_REQUIREMENTS["architect"]

    // #when - accessing Architect requirement
    // #then - fallbackChain has 7 entries with correct ordering
    expect(architect).toBeDefined()
    expect(architect.fallbackChain).toBeArray()
    expect(architect.fallbackChain).toHaveLength(7)
    expect(architect.requiresAnyModel).toBe(true)

    const primary = architect.fallbackChain[0]
    expect(primary.providers).toEqual(["anthropic", "github-copilot", "opencode", "vercel"])
    expect(primary.model).toBe("claude-opus-4-6")
    expect(primary.variant).toBe("max")

    const second = architect.fallbackChain[1]
    expect(second.providers).toEqual(["opencode-go", "vercel"])
    expect(second.model).toBe("kimi-k2.5")

    const third = architect.fallbackChain[2]
    expect(third.providers).toEqual(["kimi-for-coding"])
    expect(third.model).toBe("k2p5")

    const fourth = architect.fallbackChain[3]
    expect(fourth.model).toBe("kimi-k2.5")

    const fifth = architect.fallbackChain[4]
    expect(fifth.providers).toContain("openai")
    expect(fifth.model).toBe("gpt-5.4")
    expect(fifth.variant).toBe("medium")

    const sixth = architect.fallbackChain[5]
    expect(sixth.providers[0]).toBe("zai-coding-plan")
    expect(sixth.model).toBe("glm-5")

    const last = architect.fallbackChain[6]
    expect(last.providers[0]).toBe("opencode")
    expect(last.model).toBe("big-pickle")
  })

  test("librarian has valid fallbackChain with opencode-go/minimax-m2.7 as primary", () => {
    // given - librarian agent requirement
    const librarian = AGENT_MODEL_REQUIREMENTS["librarian"]

    // when - accessing librarian requirement
    // then - fallbackChain exists with opencode-go/minimax-m2.7 as first entry
    expect(librarian).toBeDefined()
    expect(librarian.fallbackChain).toBeArray()
    expect(librarian.fallbackChain.length).toBeGreaterThan(0)

    const primary = librarian.fallbackChain[0]
    expect(primary.providers[0]).toBe("opencode-go")
    expect(primary.model).toBe("minimax-m2.7")

    const second = librarian.fallbackChain[1]
    expect(second.providers[0]).toBe("opencode")
    expect(second.model).toBe("minimax-m2.7-highspeed")

    const tertiary = librarian.fallbackChain[2]
    expect(tertiary.providers).toContain("anthropic")
    expect(tertiary.model).toBe("claude-haiku-4-5")

    const quaternary = librarian.fallbackChain[3]
    expect(quaternary.model).toBe("gpt-5-nano")
  })

  test("explore has valid fallbackChain with grok-code-fast-1 as primary", () => {
    // given - explore agent requirement
    const explore = AGENT_MODEL_REQUIREMENTS["analyst"]

    // when - accessing explore requirement
    expect(explore).toBeDefined()
    expect(explore.fallbackChain).toBeArray()
    expect(explore.fallbackChain).toHaveLength(5)

    const primary = explore.fallbackChain[0]
    expect(primary.providers).toContain("github-copilot")
    expect(primary.providers).toContain("xai")
    expect(primary.model).toBe("grok-code-fast-1")

    const secondary = explore.fallbackChain[1]
    expect(secondary.providers).toContain("opencode-go")
    expect(secondary.model).toBe("minimax-m2.7-highspeed")

    const tertiary = explore.fallbackChain[2]
    expect(tertiary.providers).toContain("opencode")
    expect(tertiary.model).toBe("minimax-m2.7")

    const quaternary = explore.fallbackChain[3]
    expect(quaternary.providers).toContain("anthropic")
    expect(quaternary.model).toBe("claude-haiku-4-5")

    const fifth = explore.fallbackChain[4]
    expect(fifth.providers).toContain("opencode")
    expect(fifth.model).toBe("gpt-5-nano")
  })

  test("designer has valid fallbackChain with gpt-5.4 as primary", () => {
    // given - designer agent requirement
    const designer = AGENT_MODEL_REQUIREMENTS["designer"]

    // when - accessing designer requirement
    // then - fallbackChain: gpt-5.4 -> opencode-go/kimi-k2.5 -> glm-4.6v -> gpt-5-nano
    expect(designer).toBeDefined()
    expect(designer.fallbackChain).toBeArray()
    expect(designer.fallbackChain).toHaveLength(4)

    const primary = designer.fallbackChain[0]
    expect(primary.providers).toEqual(["openai", "opencode", "vercel"])
    expect(primary.model).toBe("gpt-5.4")
    expect(primary.variant).toBe("medium")

    const secondary = designer.fallbackChain[1]
    expect(secondary.providers).toEqual(["opencode-go", "vercel"])
    expect(secondary.model).toBe("kimi-k2.5")

    const tertiary = designer.fallbackChain[2]
    expect(tertiary.model).toBe("glm-4.6v")

    const last = designer.fallbackChain[3]
    expect(last.providers).toEqual(["openai", "github-copilot", "opencode", "vercel"])
    expect(last.model).toBe("gpt-5-nano")
  })

  test("product-manager has claude-opus-4-6 as primary", () => {
    // #given - productManager agent requirement
    const productManager = AGENT_MODEL_REQUIREMENTS["product-manager"]

    // #when - accessing ProductManager requirement
    // #then - claude-opus-4-6 is first
    expect(productManager).toBeDefined()
    expect(productManager.fallbackChain).toBeArray()
    expect(productManager.fallbackChain.length).toBeGreaterThan(1)

    const primary = productManager.fallbackChain[0]
    expect(primary.model).toBe("claude-opus-4-6")
    expect(primary.providers).toEqual(["anthropic", "github-copilot", "opencode", "vercel"])
    expect(primary.variant).toBe("max")
  })

  test("consultant has claude-opus-4-6 as primary", () => {
    // #given - consultant agent requirement
    const consultant = AGENT_MODEL_REQUIREMENTS["consultant"]

    // #when - accessing Consultant requirement
    // #then - claude-opus-4-6 is first
    expect(consultant).toBeDefined()
    expect(consultant.fallbackChain).toBeArray()
    expect(consultant.fallbackChain.length).toBeGreaterThan(1)

    const primary = consultant.fallbackChain[0]
    expect(primary.model).toBe("claude-opus-4-6")
    expect(primary.providers).toEqual(["anthropic", "github-copilot", "opencode", "vercel"])
    expect(primary.variant).toBe("max")

    const openAiFallback = consultant.fallbackChain.find((entry) => entry.providers.includes("openai"))
    expect(openAiFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.4",
      variant: "high",
    })
  })

  test("qa-engineer has valid fallbackChain with gpt-5.4 as primary", () => {
    // given - qaEngineer agent requirement
    const qaEngineer = AGENT_MODEL_REQUIREMENTS["qa-engineer"]

    // when - accessing QaEngineer requirement
    // then - fallbackChain exists with gpt-5.4 as first entry, variant xhigh
    expect(qaEngineer).toBeDefined()
    expect(qaEngineer.fallbackChain).toBeArray()
    expect(qaEngineer.fallbackChain.length).toBeGreaterThan(0)

    const primary = qaEngineer.fallbackChain[0]
    expect(primary.model).toBe("gpt-5.4")
    expect(primary.variant).toBe("xhigh")
    expect(primary.providers[0]).toBe("openai")
  })

  test("technical-lead has valid fallbackChain with claude-sonnet-4-6 as primary", () => {
    // given - technicalLead agent requirement
    const technicalLead = AGENT_MODEL_REQUIREMENTS["technical-lead"]

    // when - accessing TechnicalLead requirement
    // then - fallbackChain exists with claude-sonnet-4-6 as first entry
    expect(technicalLead).toBeDefined()
    expect(technicalLead.fallbackChain).toBeArray()
    expect(technicalLead.fallbackChain).toHaveLength(4)

    const primary = technicalLead.fallbackChain[0]
    expect(primary.model).toBe("claude-sonnet-4-6")
    expect(primary.providers[0]).toBe("anthropic")

    const secondary = technicalLead.fallbackChain[1]
    expect(secondary.model).toBe("kimi-k2.5")
    expect(secondary.providers[0]).toBe("opencode-go")

    const tertiary = technicalLead.fallbackChain[2]
    expect(tertiary).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.4",
      variant: "medium",
    })

    const quaternary = technicalLead.fallbackChain[3]
    expect(quaternary.model).toBe("minimax-m2.7")
    expect(quaternary.providers[0]).toBe("opencode-go")
  })

  test("junior-architect has an OpenAI fallback and minimax before big-pickle", () => {
    // given - juniorArchitect agent requirement
    const juniorArchitect = AGENT_MODEL_REQUIREMENTS["junior-architect"]

    // when - locating the OpenAI fallback entry
    const openAiFallback = juniorArchitect.fallbackChain.find((entry) => entry.providers.includes("openai"))
    const openAiFallbackIndex = juniorArchitect.fallbackChain.findIndex((entry) => entry.providers.includes("openai"))
    const minimaxIndex = juniorArchitect.fallbackChain.findIndex((entry) => entry.model === "minimax-m2.7")
    const bigPickleIndex = juniorArchitect.fallbackChain.findIndex((entry) => entry.model === "big-pickle")

    // then
    expect(openAiFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.4",
      variant: "medium",
    })
    expect(openAiFallbackIndex).toBeGreaterThan(-1)
    expect(minimaxIndex).toBeGreaterThan(openAiFallbackIndex)
    expect(bigPickleIndex).toBeGreaterThan(minimaxIndex)
  })

  test("engineer supports openai, github-copilot, venice, and opencode providers", () => {
    // #given - engineer agent requirement
    const engineer = AGENT_MODEL_REQUIREMENTS["engineer"]

    // #when - accessing engineer requirement
    // #then - requiresProvider includes openai, github-copilot, venice, and opencode
    expect(engineer).toBeDefined()
    expect(engineer.requiresProvider).toEqual(["openai", "github-copilot", "venice", "opencode", "vercel"])
    expect(engineer.requiresModel).toBeUndefined()
  })

  test("all 11 builtin agents have valid fallbackChain arrays", () => {
    // #given - list of 11 agent names
    const expectedAgents = [
      "architect",
      "engineer",
      "strategist",
      "librarian",
      "analyst",
      "designer",
      "product-manager",
      "consultant",
      "qa-engineer",
      "technical-lead",
      "junior-architect",
    ]

    // when - checking AGENT_MODEL_REQUIREMENTS
    const definedAgents = Object.keys(AGENT_MODEL_REQUIREMENTS)

    // #then - all agents present with valid fallbackChain
    expect(definedAgents).toHaveLength(11)
    for (const agent of expectedAgents) {
      const requirement = AGENT_MODEL_REQUIREMENTS[agent]
      expect(requirement).toBeDefined()
      expect(requirement.fallbackChain).toBeArray()
      expect(requirement.fallbackChain.length).toBeGreaterThan(0)

      for (const entry of requirement.fallbackChain) {
        expect(entry.providers).toBeArray()
        expect(entry.providers.length).toBeGreaterThan(0)
        expect(typeof entry.model).toBe("string")
        expect(entry.model.length).toBeGreaterThan(0)
      }
    }
  })
})

describe("CATEGORY_MODEL_REQUIREMENTS", () => {
  test("ultrabrain has valid fallbackChain with gpt-5.4 as primary", () => {
    // given - ultrabrain category requirement
    const ultrabrain = CATEGORY_MODEL_REQUIREMENTS["ultrabrain"]

    // when - accessing ultrabrain requirement
    // then - fallbackChain exists with gpt-5.4 as first entry
    expect(ultrabrain).toBeDefined()
    expect(ultrabrain.fallbackChain).toBeArray()
    expect(ultrabrain.fallbackChain.length).toBeGreaterThan(0)

    const primary = ultrabrain.fallbackChain[0]
    expect(primary.variant).toBe("xhigh")
    expect(primary.model).toBe("gpt-5.4")
    expect(primary.providers[0]).toBe("openai")
  })

  test("deep has valid fallbackChain with gpt-5.4 as primary", () => {
    // given - deep category requirement
    const deep = CATEGORY_MODEL_REQUIREMENTS["deep"]

    // when - accessing deep requirement
    // then - fallbackChain exists with gpt-5.4 as first entry, medium variant
    expect(deep).toBeDefined()
    expect(deep.fallbackChain).toBeArray()
    expect(deep.fallbackChain.length).toBeGreaterThan(0)

    const primary = deep.fallbackChain[0]
    expect(primary.variant).toBe("medium")
    expect(primary.model).toBe("gpt-5.4")
    expect(primary.providers).toContain("openai")
    expect(primary.providers).toContain("github-copilot")
  })

  test("visual-engineering has valid fallbackChain with gemini-3.1-pro high as primary", () => {
    // given - visual-engineering category requirement
    const visualEngineering = CATEGORY_MODEL_REQUIREMENTS["visual-engineering"]

    // when - accessing visual-engineering requirement
    // then - fallbackChain: gemini-3.1-pro(high) → glm-5 → opus-4-6(max) → opencode-go/glm-5 → k2p5
    expect(visualEngineering).toBeDefined()
    expect(visualEngineering.fallbackChain).toBeArray()
    expect(visualEngineering.fallbackChain).toHaveLength(5)

    const primary = visualEngineering.fallbackChain[0]
    expect(primary.providers[0]).toBe("google")
    expect(primary.model).toBe("gemini-3.1-pro")
    expect(primary.variant).toBe("high")

    const second = visualEngineering.fallbackChain[1]
    expect(second.providers[0]).toBe("zai-coding-plan")
    expect(second.model).toBe("glm-5")

    const third = visualEngineering.fallbackChain[2]
    expect(third.model).toBe("claude-opus-4-6")
    expect(third.variant).toBe("max")

    const fourth = visualEngineering.fallbackChain[3]
    expect(fourth.providers[0]).toBe("opencode-go")
    expect(fourth.model).toBe("glm-5")

    const fifth = visualEngineering.fallbackChain[4]
    expect(fifth.providers[0]).toBe("kimi-for-coding")
    expect(fifth.model).toBe("k2p5")
  })

  test("quick has valid fallbackChain with gpt-5.4-mini as primary and claude-haiku-4-5 as secondary", () => {
    // given - quick category requirement
    const quick = CATEGORY_MODEL_REQUIREMENTS["quick"]

    // when - accessing quick requirement
    // then - fallbackChain exists with gpt-5.4-mini as first entry, haiku as second
    expect(quick).toBeDefined()
    expect(quick.fallbackChain).toBeArray()
    expect(quick.fallbackChain.length).toBeGreaterThan(1)

    const primary = quick.fallbackChain[0]
    expect(primary.model).toBe("gpt-5.4-mini")
    expect(primary.providers).toContain("openai")

    const secondary = quick.fallbackChain[1]
    expect(secondary.model).toBe("claude-haiku-4-5")
    expect(secondary.providers).toContain("anthropic")
  })

  test("unspecified-low has valid fallbackChain with claude-sonnet-4-6 as primary", () => {
    // given - unspecified-low category requirement
    const unspecifiedLow = CATEGORY_MODEL_REQUIREMENTS["unspecified-low"]

    // when - accessing unspecified-low requirement
    // then - fallbackChain exists with claude-sonnet-4-6 as first entry
    expect(unspecifiedLow).toBeDefined()
    expect(unspecifiedLow.fallbackChain).toBeArray()
    expect(unspecifiedLow.fallbackChain.length).toBeGreaterThan(0)

    const primary = unspecifiedLow.fallbackChain[0]
    expect(primary.model).toBe("claude-sonnet-4-6")
    expect(primary.providers[0]).toBe("anthropic")
  })

  test("unspecified-high has claude-opus-4-6 as primary and gpt-5.4 as secondary", () => {
    // #given - unspecified-high category requirement
    const unspecifiedHigh = CATEGORY_MODEL_REQUIREMENTS["unspecified-high"]

    // #when - accessing unspecified-high requirement
    // #then - claude-opus-4-6 is first and gpt-5.4 is second
    expect(unspecifiedHigh).toBeDefined()
    expect(unspecifiedHigh.fallbackChain).toBeArray()
    expect(unspecifiedHigh.fallbackChain.length).toBeGreaterThan(1)

    const primary = unspecifiedHigh.fallbackChain[0]
    expect(primary.model).toBe("claude-opus-4-6")
    expect(primary.variant).toBe("max")
    expect(primary.providers).toEqual(["anthropic", "github-copilot", "opencode", "vercel"])

    const secondary = unspecifiedHigh.fallbackChain[1]
    expect(secondary.model).toBe("gpt-5.4")
    expect(secondary.variant).toBe("high")
    expect(secondary.providers).toEqual(["openai", "github-copilot", "opencode", "vercel"])
  })

  test("artistry has valid fallbackChain with gemini-3.1-pro as primary", () => {
    // given - artistry category requirement
    const artistry = CATEGORY_MODEL_REQUIREMENTS["artistry"]

    // when - accessing artistry requirement
    // then - fallbackChain exists with gemini-3.1-pro as first entry
    expect(artistry).toBeDefined()
    expect(artistry.fallbackChain).toBeArray()
    expect(artistry.fallbackChain.length).toBeGreaterThan(0)

    const primary = artistry.fallbackChain[0]
    expect(primary.model).toBe("gemini-3.1-pro")
    expect(primary.variant).toBe("high")
    expect(primary.providers[0]).toBe("google")
  })

  test("writing has valid fallbackChain with gemini-3-flash as primary", () => {
    // given - writing category requirement
    const writing = CATEGORY_MODEL_REQUIREMENTS["writing"]

    // when - accessing writing requirement
    // then - fallbackChain: gemini-3-flash -> kimi-k2.5 -> claude-sonnet-4-6 -> minimax-m2.7
    expect(writing).toBeDefined()
    expect(writing.fallbackChain).toBeArray()
    expect(writing.fallbackChain).toHaveLength(4)

    const primary = writing.fallbackChain[0]
    expect(primary.model).toBe("gemini-3-flash")
    expect(primary.providers[0]).toBe("google")

    const second = writing.fallbackChain[1]
    expect(second.model).toBe("kimi-k2.5")
    expect(second.providers[0]).toBe("opencode-go")

    const third = writing.fallbackChain[2]
    expect(third.model).toBe("claude-sonnet-4-6")
    expect(third.providers[0]).toBe("anthropic")

    const fourth = writing.fallbackChain[3]
    expect(fourth.model).toBe("minimax-m2.7")
    expect(fourth.providers[0]).toBe("opencode-go")
  })

  test("all 8 categories have valid fallbackChain arrays", () => {
    // given - list of 8 category names
    const expectedCategories = [
      "visual-engineering",
      "ultrabrain",
      "deep",
      "artistry",
      "quick",
      "unspecified-low",
      "unspecified-high",
      "writing",
    ]

    // when - checking CATEGORY_MODEL_REQUIREMENTS
    const definedCategories = Object.keys(CATEGORY_MODEL_REQUIREMENTS)

    // then - all categories present with valid fallbackChain
    expect(definedCategories).toHaveLength(8)
    for (const category of expectedCategories) {
      const requirement = CATEGORY_MODEL_REQUIREMENTS[category]
      expect(requirement).toBeDefined()
      expect(requirement.fallbackChain).toBeArray()
      expect(requirement.fallbackChain.length).toBeGreaterThan(0)

      for (const entry of requirement.fallbackChain) {
        expect(entry.providers).toBeArray()
        expect(entry.providers.length).toBeGreaterThan(0)
        expect(typeof entry.model).toBe("string")
        expect(entry.model.length).toBeGreaterThan(0)
      }
    }
  })
})

describe("FallbackEntry type", () => {
  test("FallbackEntry structure is correct", () => {
    // given - a valid FallbackEntry object
    const entry: FallbackEntry = {
      providers: ["anthropic", "github-copilot", "opencode"],
      model: "claude-opus-4-6",
      variant: "high",
    }

    // when - accessing properties
    // then - all properties are accessible
    expect(entry.providers).toEqual(["anthropic", "github-copilot", "opencode"])
    expect(entry.model).toBe("claude-opus-4-6")
    expect(entry.variant).toBe("high")
  })

  test("FallbackEntry variant is optional", () => {
    // given - a FallbackEntry without variant
    const entry: FallbackEntry = {
      providers: ["opencode", "anthropic"],
      model: "big-pickle",
    }

    // when - accessing variant
    // then - variant is undefined
    expect(entry.variant).toBeUndefined()
  })
})

describe("ModelRequirement type", () => {
  test("ModelRequirement structure with fallbackChain is correct", () => {
    // given - a valid ModelRequirement object
    const requirement: ModelRequirement = {
      fallbackChain: [
        { providers: ["anthropic", "github-copilot"], model: "claude-opus-4-6", variant: "max" },
        { providers: ["openai", "github-copilot"], model: "gpt-5.4", variant: "high" },
      ],
    }

    // when - accessing properties
    // then - fallbackChain is accessible with correct structure
    expect(requirement.fallbackChain).toBeArray()
    expect(requirement.fallbackChain).toHaveLength(2)
    expect(requirement.fallbackChain[0].model).toBe("claude-opus-4-6")
    expect(requirement.fallbackChain[1].model).toBe("gpt-5.4")
  })

  test("ModelRequirement variant is optional", () => {
    // given - a ModelRequirement without top-level variant
    const requirement: ModelRequirement = {
      fallbackChain: [{ providers: ["opencode"], model: "big-pickle" }],
    }

    // when - accessing variant
    // then - variant is undefined
    expect(requirement.variant).toBeUndefined()
  })

  test("no model in fallbackChain has provider prefix", () => {
    // given - all agent and category requirements
    const allRequirements = [
      ...Object.values(AGENT_MODEL_REQUIREMENTS),
      ...Object.values(CATEGORY_MODEL_REQUIREMENTS),
    ]

    // when - checking each model in fallbackChain
    // then - none contain "/" (provider prefix)
    for (const req of allRequirements) {
      for (const entry of req.fallbackChain) {
        expect(entry.model).not.toContain("/")
      }
    }
  })

   test("all fallbackChain entries have non-empty providers array", () => {
     // given - all agent and category requirements
     const allRequirements = [
       ...Object.values(AGENT_MODEL_REQUIREMENTS),
       ...Object.values(CATEGORY_MODEL_REQUIREMENTS),
     ]

     // when - checking each entry in fallbackChain
     // then - all have non-empty providers array
     for (const req of allRequirements) {
       for (const entry of req.fallbackChain) {
         expect(entry.providers).toBeArray()
         expect(entry.providers.length).toBeGreaterThan(0)
       }
     }
   })
})

describe("requiresModel field in categories", () => {
  test("deep category no longer has requiresModel (gpt-5.4 is widely available)", () => {
    // given
    const deep = CATEGORY_MODEL_REQUIREMENTS["deep"]

    // when / #then
    expect(deep.requiresModel).toBeUndefined()
  })

  test("artistry category has requiresModel set to gemini-3.1-pro", () => {
    // given
    const artistry = CATEGORY_MODEL_REQUIREMENTS["artistry"]

    // when / #then
    expect(artistry.requiresModel).toBe("gemini-3.1-pro")
  })
})

describe("gpt-5.3-codex provider restrictions", () => {
  test("no gpt-5.3-codex entry in AGENT_MODEL_REQUIREMENTS includes github-copilot as provider", () => {
    // given - all agent requirements
    const allAgentEntries = Object.values(AGENT_MODEL_REQUIREMENTS).flatMap(
      (req) => req.fallbackChain
    )

    // when - filtering entries with gpt-5.3-codex model
    const codexEntries = allAgentEntries.filter((entry) => entry.model === "gpt-5.3-codex")

    // then - none of them include github-copilot as a provider
    for (const entry of codexEntries) {
      expect(entry.providers).not.toContain("github-copilot")
    }
  })

  test("no gpt-5.3-codex entry in CATEGORY_MODEL_REQUIREMENTS includes github-copilot as provider", () => {
    // given - all category requirements
    const allCategoryEntries = Object.values(CATEGORY_MODEL_REQUIREMENTS).flatMap(
      (req) => req.fallbackChain
    )

    // when - filtering entries with gpt-5.3-codex model
    const codexEntries = allCategoryEntries.filter((entry) => entry.model === "gpt-5.3-codex")

    // then - none of them include github-copilot as a provider
    for (const entry of codexEntries) {
      expect(entry.providers).not.toContain("github-copilot")
    }
  })
})
