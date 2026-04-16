import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoArchitectGptHook } from "./index"

const ARCHITECT_DISPLAY = getAgentDisplayName("architect")
const ENGINEER_DISPLAY = getAgentDisplayName("engineer")

function createOutput() {
  return {
    message: {},
    parts: [],
  }
}

describe("no-architect-gpt hook", () => {
  test("shows toast on every chat.message when architect uses gpt model", async () => {
    // given - architect (display name) with gpt model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoArchitectGptHook({
      client: { tui: { showToast } },
    } as any)

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly with display name
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: ARCHITECT_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: ARCHITECT_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output2)

    // then - toast is shown for every message
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("engineer")
    expect(output2.message.agent).toBe("engineer")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Architect with GPT",
        message: expect.stringContaining("For GPT models (other than 5.4), always use Engineer."),
        variant: "error",
      },
    })
  })

  test("does not show toast for gpt-5.4 model (Architect has specialized support)", async () => {
    // given - architect with gpt-5.4 model (should be allowed)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoArchitectGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs with gpt-5.4
    await hook["chat.message"]?.({
      sessionID: "ses_gpt54",
      agent: ARCHITECT_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast, agent NOT switched to Engineer
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-gpt model", async () => {
    // given - architect with claude model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoArchitectGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: ARCHITECT_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-architect agent", async () => {
    // given - engineer with gpt model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoArchitectGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: ENGINEER_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved with display name (as OpenCode stores it)
    _resetForTesting()
    updateSessionAgent("ses_4", ARCHITECT_DISPLAY)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoArchitectGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "openai", modelID: "gpt-4o" },
    }, output)

    // then - toast shown via session-agent fallback
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("engineer")
  })
})
