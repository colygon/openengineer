import { describe, test, expect } from "bun:test"
import { createStrategistAgent } from "./strategist"
import { createLibrarianAgent } from "./librarian"
import { createAnalystAgent } from "./analyst"
import { createQaEngineerAgent } from "./qa-engineer"
import { createConsultantAgent } from "./consultant"
import { createTechnicalLeadAgent } from "./technical-lead"
import { createArchitectAgent } from "./architect"

const TEST_MODEL = "anthropic/claude-sonnet-4-5"

describe("read-only agent tool restrictions", () => {
  const FILE_WRITE_TOOLS = ["write", "edit", "apply_patch"]

  describe("Strategist", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createStrategistAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("denies task but allows call_agent for research", () => {
      // given
      const agent = createStrategistAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      expect(permission["task"]).toBe("deny")
      expect(permission["call_agent"]).toBeUndefined()
    })
  })

  describe("Librarian", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createLibrarianAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Explore", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createAnalystAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("QaEngineer", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createQaEngineerAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Consultant", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createConsultantAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("TechnicalLead", () => {
    test("allows delegation tools for orchestration", () => {
      // given
      const agent = createTechnicalLeadAgent({ model: TEST_MODEL })

      // when
      const permission = (agent.permission ?? {}) as Record<string, string>

      // then
      expect(permission["task"]).toBeUndefined()
      expect(permission["call_agent"]).toBeUndefined()
    })
  })

  describe("Architect GPT variants", () => {
    test("deny apply_patch for GPT models but not Claude models", () => {
      // given
      const gpt54Agent = createArchitectAgent("openai/gpt-5.4")
      const gptGenericAgent = createArchitectAgent("openai/gpt-5.2")
      const claudeAgent = createArchitectAgent(TEST_MODEL)

      // when
      const gpt54Permission = (gpt54Agent.permission ?? {}) as Record<string, string>
      const gptGenericPermission = (gptGenericAgent.permission ?? {}) as Record<string, string>
      const claudePermission = (claudeAgent.permission ?? {}) as Record<string, string>

      // then
      expect(gpt54Permission["apply_patch"]).toBe("deny")
      expect(gptGenericPermission["apply_patch"]).toBe("deny")
      expect(claudePermission["apply_patch"]).toBeUndefined()
    })
  })
})
