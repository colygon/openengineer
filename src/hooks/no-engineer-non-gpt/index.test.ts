/// <reference types="bun-types" />

import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoEngineerNonGptHook } from "./index"

const ENGINEER_DISPLAY = getAgentDisplayName("engineer")
const ARCHITECT_DISPLAY = getAgentDisplayName("architect")

function createOutput() {
  return {
    message: {} as { agent?: string; [key: string]: unknown },
    parts: [],
  }
}

describe("no-engineer-non-gpt hook", () => {
  test("shows toast on every chat.message when engineer uses non-gpt model", async () => {
    // given - engineer with claude model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoEngineerNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: ENGINEER_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: ENGINEER_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output2)

    // then - toast is shown and agent is switched to architect
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("architect")
    expect(output2.message.agent).toBe("architect")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Engineer with Non-GPT",
        message: expect.stringContaining("Engineer is trash without GPT."),
        variant: "error",
      },
    })
  })

  test("shows warning and does not switch agent when allow_non_gpt_model is enabled", async () => {
    // given - engineer with claude model and opt-out enabled
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoEngineerNonGptHook({
      client: { tui: { showToast } },
    } as any, {
      allowNonGptModel: true,
    })

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_opt_out",
      agent: ENGINEER_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - warning toast is shown but agent is not switched
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBeUndefined()
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Engineer with Non-GPT",
        variant: "warning",
      },
    })
  })

  test("does not show toast when engineer uses gpt model", async () => {
    // given - engineer with gpt model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoEngineerNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: ENGINEER_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output)

    // then - no toast, agent unchanged
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-engineer agent", async () => {
    // given - architect with claude model (non-gpt)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoEngineerNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: ARCHITECT_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved as engineer
    _resetForTesting()
    updateSessionAgent("ses_4", ENGINEER_DISPLAY)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoEngineerNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - toast shown via session-agent fallback, switched to architect
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("architect")
  })
})
