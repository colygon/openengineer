import { describe, test, expect } from "bun:test"
import { TECHNICAL_LEAD_SYSTEM_PROMPT } from "./default"
import { TECHNICAL_LEAD_GPT_SYSTEM_PROMPT } from "./gpt"
import { TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT } from "./gemini"

describe("TechnicalLead prompts auto-continue policy", () => {
  test("default variant should forbid asking user for continuation confirmation", () => {
    // given
    const prompt = TECHNICAL_LEAD_SYSTEM_PROMPT

    // when
    const lowerPrompt = prompt.toLowerCase()

    // then
    expect(lowerPrompt).toContain("auto-continue policy")
    expect(lowerPrompt).toContain("never ask the user")
    expect(lowerPrompt).toContain("should i continue")
    expect(lowerPrompt).toContain("proceed to next task")
    expect(lowerPrompt).toContain("approval-style")
    expect(lowerPrompt).toContain("auto-continue immediately")
  })

  test("gpt variant should forbid asking user for continuation confirmation", () => {
    // given
    const prompt = TECHNICAL_LEAD_GPT_SYSTEM_PROMPT

    // when
    const lowerPrompt = prompt.toLowerCase()

    // then
    expect(lowerPrompt).toContain("auto-continue policy")
    expect(lowerPrompt).toContain("never ask the user")
    expect(lowerPrompt).toContain("should i continue")
    expect(lowerPrompt).toContain("proceed to next task")
    expect(lowerPrompt).toContain("approval-style")
    expect(lowerPrompt).toContain("auto-continue immediately")
  })

  test("gemini variant should forbid asking user for continuation confirmation", () => {
    // given
    const prompt = TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT

    // when
    const lowerPrompt = prompt.toLowerCase()

    // then
    expect(lowerPrompt).toContain("auto-continue policy")
    expect(lowerPrompt).toContain("never ask the user")
    expect(lowerPrompt).toContain("should i continue")
    expect(lowerPrompt).toContain("proceed to next task")
    expect(lowerPrompt).toContain("approval-style")
    expect(lowerPrompt).toContain("auto-continue immediately")
  })

  test("all variants should require immediate continuation after verification passes", () => {
    // given
    const prompts = [TECHNICAL_LEAD_SYSTEM_PROMPT, TECHNICAL_LEAD_GPT_SYSTEM_PROMPT, TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT]

    // when / then
    for (const prompt of prompts) {
      const lowerPrompt = prompt.toLowerCase()
      expect(lowerPrompt).toMatch(/auto-continue immediately after verification/)
      expect(lowerPrompt).toMatch(/immediately delegate next task/)
    }
  })

  test("all variants should define when user interaction is actually needed", () => {
    // given
    const prompts = [TECHNICAL_LEAD_SYSTEM_PROMPT, TECHNICAL_LEAD_GPT_SYSTEM_PROMPT, TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT]

    // when / then
    for (const prompt of prompts) {
      const lowerPrompt = prompt.toLowerCase()
      expect(lowerPrompt).toMatch(/only pause.*truly blocked/)
      expect(lowerPrompt).toMatch(/plan needs clarification|blocked by external/)
    }
  })
})

describe("TechnicalLead prompts anti-duplication coverage", () => {
  test("all variants should include anti-duplication rules for delegated exploration", () => {
    // given
    const prompts = [TECHNICAL_LEAD_SYSTEM_PROMPT, TECHNICAL_LEAD_GPT_SYSTEM_PROMPT, TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT]

    // when / then
    for (const prompt of prompts) {
      expect(prompt).toContain("<Anti_Duplication>")
      expect(prompt).toContain("Anti-Duplication Rule")
      expect(prompt).toContain("DO NOT perform the same search yourself")
      expect(prompt).toContain("non-overlapping work")
    }
  })
})

describe("TechnicalLead prompts plan path consistency", () => {
  test("default variant should use .openengineer/plans/{plan-name}.md path", () => {
    // given
    const prompt = TECHNICAL_LEAD_SYSTEM_PROMPT

    // when / then
    expect(prompt).toContain(".openengineer/plans/{plan-name}.md")
    expect(prompt).not.toContain(".openengineer/tasks/{plan-name}.yaml")
    expect(prompt).not.toContain(".openengineer/tasks/")
  })

  test("gpt variant should use .openengineer/plans/{plan-name}.md path", () => {
    // given
    const prompt = TECHNICAL_LEAD_GPT_SYSTEM_PROMPT

    // when / then
    expect(prompt).toContain(".openengineer/plans/{plan-name}.md")
    expect(prompt).not.toContain(".openengineer/tasks/")
  })

  test("gemini variant should use .openengineer/plans/{plan-name}.md path", () => {
    // given
    const prompt = TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT

    // when / then
    expect(prompt).toContain(".openengineer/plans/{plan-name}.md")
    expect(prompt).not.toContain(".openengineer/tasks/")
  })

  test("all variants should read plan file after verification", () => {
    // given
    const prompts = [TECHNICAL_LEAD_SYSTEM_PROMPT, TECHNICAL_LEAD_GPT_SYSTEM_PROMPT, TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT]

    // when / then
    for (const prompt of prompts) {
      expect(prompt).toMatch(/read[\s\S]*?\.openengineer\/plans\//)
    }
  })

  test("all variants should distinguish top-level plan tasks from nested checkboxes", () => {
    // given
    const prompts = [TECHNICAL_LEAD_SYSTEM_PROMPT, TECHNICAL_LEAD_GPT_SYSTEM_PROMPT, TECHNICAL_LEAD_GEMINI_SYSTEM_PROMPT]

    // when / then
    for (const prompt of prompts) {
      const lowerPrompt = prompt.toLowerCase()
      expect(lowerPrompt).toMatch(/top-level.*checkbox/)
      expect(lowerPrompt).toMatch(/ignore nested.*checkbox/)
      expect(lowerPrompt).toMatch(/final verification wave/)
    }
  })
})
