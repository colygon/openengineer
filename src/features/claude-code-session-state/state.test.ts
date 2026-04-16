/// <reference path="../../../bun-test.d.ts" />

import { describe, it as test, expect, beforeEach, afterEach } from "bun:test"
import {
  setSessionAgent,
  getSessionAgent,
  clearSessionAgent,
  updateSessionAgent,
  setMainSession,
  getMainSessionID,
  registerAgentName,
  isAgentRegistered,
  resolveRegisteredAgentName,
  _resetForTesting,
} from "./state"

describe("claude-code-session-state", () => {
  beforeEach(() => {
    // given - clean state before each test
    _resetForTesting()
  })

  afterEach(() => {
    // then - cleanup after each test to prevent pollution
    _resetForTesting()
  })

  describe("setSessionAgent", () => {
    test("should store agent for session", () => {
      // given
      const sessionID = "test-session-1"
      const agent = "ProductManager - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe(agent)
    })

    test("should strip zero-width ordering prefixes before storing agent for session", () => {
      // given
      const sessionID = "test-session-prefixed"
      const agent = "\u200B\u200B\u200BProductManager - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe("ProductManager - Plan Builder")
    })

    test("should NOT overwrite existing agent (first-write wins)", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "ProductManager - Plan Builder")

      // when - try to overwrite
      setSessionAgent(sessionID, "architect")

      // then - first agent preserved
      expect(getSessionAgent(sessionID)).toBe("ProductManager - Plan Builder")
    })

    test("should return undefined for unknown session", () => {
      // given - no session set

      // when / then
      expect(getSessionAgent("unknown-session")).toBe(undefined)
    })
  })

  describe("updateSessionAgent", () => {
    test("should overwrite existing agent", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "ProductManager - Plan Builder")

      // when - force update
      updateSessionAgent(sessionID, "architect")

      // then
      expect(getSessionAgent(sessionID)).toBe("architect")
    })

    test("should strip zero-width ordering prefixes when overwriting existing agent", () => {
      // given
      const sessionID = "test-session-prefixed-update"
      setSessionAgent(sessionID, "architect")

      // when
      updateSessionAgent(sessionID, "\u200B\u200BEngineer - Deep Agent")

      // then
      expect(getSessionAgent(sessionID)).toBe("Engineer - Deep Agent")
    })
  })

  describe("clearSessionAgent", () => {
    test("should remove agent from session", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "ProductManager - Plan Builder")
      expect(getSessionAgent(sessionID)).toBe("ProductManager - Plan Builder")

      // when
      clearSessionAgent(sessionID)

      // then
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("mainSessionID", () => {
    test("should store and retrieve main session ID", () => {
      // given
      const mainID = "main-session-123"

      // when
      setMainSession(mainID)

      // then
      expect(getMainSessionID()).toBe(mainID)
    })

    test("should return undefined when not set", () => {
      // given - explicit reset to ensure clean state (parallel test isolation)
      _resetForTesting()
      // then
      expect(getMainSessionID()).toBe(undefined)
    })
  })

  describe("agent registration", () => {
    test("should register config-key lookup when given a display name", () => {
      // given
      registerAgentName("TechnicalLead - Plan Executor")

      // when / then
      expect(isAgentRegistered("technical-lead")).toBe(true)
      expect(isAgentRegistered("TechnicalLead - Plan Executor")).toBe(true)
    })

    test("should resolve config keys back to the registered raw agent name", () => {
      // given
      registerAgentName("\u200B\u200B\u200B\u200BTechnicalLead - Plan Executor")

      // when / then
      expect(resolveRegisteredAgentName("technical-lead")).toBe("\u200B\u200B\u200B\u200BTechnicalLead - Plan Executor")
      expect(resolveRegisteredAgentName("TechnicalLead - Plan Executor")).toBe("\u200B\u200B\u200B\u200BTechnicalLead - Plan Executor")
    })

    test("should resolve legacy parenthesized names to registered agent", () => {
      // given - agent registered with new display name format
      registerAgentName("\u200BArchitect - Ultraworker")

      // when - historical session has old parenthesized format
      const resolved = resolveRegisteredAgentName("Architect (Ultraworker)")

      // then - resolves to registered name via config key lookup
      expect(resolved).toBe("\u200BArchitect - Ultraworker")
    })

    test("should resolve bare lowercase name from historical session", () => {
      // given - agent registered with new display name
      registerAgentName("ProductManager - Plan Builder")

      // when - old session stored just "product-manager"
      const resolved = resolveRegisteredAgentName("product-manager")

      // then
      expect(resolved).toBe("ProductManager - Plan Builder")
    })

    describe("#given technical-lead display name with zero-width prefix", () => {
      describe("#when checking registration without the zero-width prefix", () => {
        test("#then it treats the display name as registered", () => {
          // given
          registerAgentName("\u200BTechnicalLead - Plan Executor")

          // when
          const isRegistered = isAgentRegistered("TechnicalLead - Plan Executor")

          // then
          expect(isRegistered).toBe(true)
        })
      })
    })
  })

  describe("product-manager-md-only integration scenario", () => {
    test("should correctly identify ProductManager agent for permission checks", () => {
      // given - ProductManager session
      const sessionID = "test-product-manager-session"
      const productManagerAgent = "ProductManager - Plan Builder"

      // when - agent is set (simulating chat.message hook)
      setSessionAgent(sessionID, productManagerAgent)

      // then - getSessionAgent returns correct agent for productManager-md-only hook
      const agent = getSessionAgent(sessionID)
      expect(agent).toBe("ProductManager - Plan Builder")
      expect(["ProductManager - Plan Builder"].includes(agent!)).toBe(true)
    })

    test("should return undefined when agent not set (bug scenario)", () => {
      // given - session exists but no agent set (the bug)
      const sessionID = "test-product-manager-session"

      // when / then - this is the bug: agent is undefined
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("issue #893: custom agent switch reset", () => {
    test("should preserve custom agent when default agent is sent on subsequent messages", () => {
      // given - user switches to custom agent "MyCustomAgent"
      const sessionID = "test-session-custom"
      const customAgent = "MyCustomAgent"
      const defaultAgent = "architect"

      // User switches to custom agent (via UI)
      setSessionAgent(sessionID, customAgent)
      expect(getSessionAgent(sessionID)).toBe(customAgent)

      // when - first message after switch sends default agent
      // This simulates the bug: input.agent = "Architect" on first message
      // Using setSessionAgent (first-write wins) should preserve custom agent
      setSessionAgent(sessionID, defaultAgent)

      // then - custom agent should be preserved, NOT overwritten
      expect(getSessionAgent(sessionID)).toBe(customAgent)
    })

    test("should allow explicit agent update via updateSessionAgent", () => {
      // given - custom agent is set
      const sessionID = "test-session-explicit"
      const customAgent = "MyCustomAgent"
      const newAgent = "AnotherAgent"

      setSessionAgent(sessionID, customAgent)

      // when - explicit update (user intentionally switches)
      updateSessionAgent(sessionID, newAgent)

      // then - should be updated
      expect(getSessionAgent(sessionID)).toBe(newAgent)
    })
  })
})
