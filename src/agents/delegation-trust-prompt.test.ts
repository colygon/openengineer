import { describe, expect, test } from "bun:test"
import { createArchitectAgent } from "./architect"
import { createEngineerAgent } from "./engineer"
import { buildJuniorArchitectPrompt } from "./junior-architect/agent"
import {
  buildAntiDuplicationSection,
  buildExploreSection,
  type AvailableAgent,
} from "./dynamic-agent-prompt-builder"

const exploreAgent = {
  name: "analyst",
  description: "Contextual grep specialist",
  metadata: {
    category: "advisor",
    cost: "FREE",
    promptAlias: "Explore",
    triggers: [],
    useWhen: ["Multiple search angles needed"],
    avoidWhen: ["Single keyword search is enough"],
  },
} satisfies AvailableAgent

describe("delegation trust prompt rules", () => {
  test("buildAntiDuplicationSection explains overlap is forbidden", () => {
    // given
    const section = buildAntiDuplicationSection()

    // when / then
    expect(section).toContain("DO NOT perform the same search yourself")
    expect(section).toContain("non-overlapping work")
    expect(section).toContain("End your response")
  })

  test("buildExploreSection includes delegation trust rule", () => {
    // given
    const agents = [exploreAgent]

    // when
    const section = buildExploreSection(agents)

    // then
    expect(section).toContain("Delegation Trust Rule")
    expect(section).toContain("do **not** manually perform that same search yourself")
  })

  test("Architect prompt forbids duplicate delegated exploration", () => {
    // given
    const agent = createArchitectAgent("anthropic/claude-sonnet-4-6", [exploreAgent])

    // when
    const prompt = agent.prompt

    // then
    expect(prompt).toContain("Continue only with non-overlapping work")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Engineer prompt forbids duplicate delegated exploration", () => {
    // given
    const agent = createEngineerAgent("openai/gpt-5.2", [exploreAgent])

    // when
    const prompt = agent.prompt

    // then
    expect(prompt).toContain("Continue only with non-overlapping work after launching background agents")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Engineer GPT-5.4 prompt forbids duplicate delegated exploration", () => {
    // given
    const agent = createEngineerAgent("openai/gpt-5.4", [exploreAgent])

    // when
    const prompt = agent.prompt

    // then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("Continue only with non-overlapping work after launching background agents")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Engineer GPT-5.3 Codex prompt forbids duplicate delegated exploration", () => {
    // given
    const agent = createEngineerAgent("openai/gpt-5.3-codex", [exploreAgent])

    // when
    const prompt = agent.prompt

    // then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("Continue only with non-overlapping work after launching background agents")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Architect-Junior GPT prompt forbids duplicate delegated exploration", () => {
    // given
    const prompt = buildJuniorArchitectPrompt("openai/gpt-5.2", false)

    // when / then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Architect GPT-5.4 prompt forbids duplicate delegated exploration", () => {
    // given
    const agent = createArchitectAgent("openai/gpt-5.4", [exploreAgent])

    // when
    const prompt = agent.prompt

    // then
    expect(prompt).toContain("do only non-overlapping work simultaneously")
    expect(prompt).toContain("Continue only with non-overlapping work")
    expect(prompt).toContain("DO NOT perform the same search yourself")
    expect(prompt).toContain("Do not use `apply_patch`")
    expect(prompt).toContain("`edit` and `write`")
  })

  test("Architect-Junior GPT-5.4 prompt forbids duplicate delegated exploration", () => {
    // given
    const prompt = buildJuniorArchitectPrompt("openai/gpt-5.4", false)

    // when / then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Architect-Junior GPT-5.3 Codex prompt forbids duplicate delegated exploration", () => {
    // given
    const prompt = buildJuniorArchitectPrompt("openai/gpt-5.3-codex", false)

    // when / then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })

  test("Architect-Junior Gemini prompt forbids duplicate delegated exploration", () => {
    // given
    const prompt = buildJuniorArchitectPrompt("google/gemini-3.1-pro", false)

    // when / then
    expect(prompt).toContain("continue only with non-overlapping work while they search")
    expect(prompt).toContain("DO NOT perform the same search yourself")
  })
})
