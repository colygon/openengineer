/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import {
  reorderAgentsByPriority,
  CANONICAL_CORE_AGENT_ORDER,
} from "./agent-priority-order"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("agent-priority-order", () => {
  describe("CANONICAL_CORE_AGENT_ORDER", () => {
    // given: The canonical order constant must exist and be correct

    test("exports canonical order as readonly array", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toBeDefined()
      expect(Array.isArray(CANONICAL_CORE_AGENT_ORDER)).toBe(true)
    })

    test("canonical order is exactly [architect, engineer, product-manager, technical-lead]", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toEqual([
        "architect",
        "engineer",
        "product-manager",
        "technical-lead",
      ])
    })

    test("canonical order length is exactly 4", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toHaveLength(4)
    })
  })

  describe("reorderAgentsByPriority", () => {
    // given: display names for all core agents
    const architect = getAgentListDisplayName("architect")
    const engineer = getAgentListDisplayName("engineer")
    const productManager = getAgentListDisplayName("product-manager")
    const technicalLead = getAgentListDisplayName("technical-lead")
    const strategist = getAgentDisplayName("strategist")
    const librarian = getAgentDisplayName("librarian")
    const explore = getAgentDisplayName("analyst")

    describe("#given agents in random order", () => {
      test("#when all core agents present #then orders as architect→engineer→product-manager→technical-lead", () => {
        // given: agents in reverse order
        const agents: Record<string, unknown> = {
          [technical-lead]: { name: "technical-lead" },
          [product-manager]: { name: "product-manager" },
          [engineer]: { name: "engineer" },
          [architect]: { name: "architect" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys[0]).toBe(architect)
        expect(keys[1]).toBe(engineer)
        expect(keys[2]).toBe(productManager)
        expect(keys[3]).toBe(technicalLead)
      })

      test("#when core agents mixed with non-core #then core agents come first in canonical order", () => {
        // given: mixed order with non-core agents interleaved
        const agents: Record<string, unknown> = {
          [strategist]: { name: "strategist" },
          [technical-lead]: { name: "technical-lead" },
          [librarian]: { name: "librarian" },
          [product-manager]: { name: "product-manager" },
          [explore]: { name: "analyst" },
          [engineer]: { name: "engineer" },
          custom: { name: "custom" },
          [architect]: { name: "architect" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys.slice(0, 4)).toEqual([architect, engineer, productManager, technicalLead])
      })
    })

    describe("#given 100 random permutations", () => {
      test("#when reordered #then result is ALWAYS identical", () => {
        // given: base agent config
        const baseAgents = {
          [architect]: { name: "architect" },
          [engineer]: { name: "engineer" },
          [product-manager]: { name: "product-manager" },
          [technical-lead]: { name: "technical-lead" },
          [strategist]: { name: "strategist" },
          [librarian]: { name: "librarian" },
          custom1: { name: "custom1" },
          custom2: { name: "custom2" },
        }

        // given: shuffle function
        const shuffle = <T>(array: T[]): T[] => {
          const result = [...array]
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j], result[i]]
          }
          return result
        }

        // when: run 100 times with different key orders
        const results: string[][] = []
        for (let i = 0; i < 100; i++) {
          const shuffledKeys = shuffle(Object.keys(baseAgents))
          const shuffledAgents: Record<string, unknown> = {}
          for (const key of shuffledKeys) {
            shuffledAgents[key] = baseAgents[key]
          }
          const result = reorderAgentsByPriority(shuffledAgents)
          results.push(Object.keys(result))
        }

        // then: all results should have identical key order
        const firstResult = results[0]
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(firstResult)
        }

        // then: core agents are always first 4 in canonical order
        expect(firstResult.slice(0, 4)).toEqual([
          architect,
          engineer,
          productManager,
          technicalLead,
        ])
      })
    })

    describe("#given partial core agents", () => {
      test("#when only architect and technical-lead present #then orders as architect→technical-lead", () => {
        // given
        const agents: Record<string, unknown> = {
          [technical-lead]: { name: "technical-lead" },
          custom: { name: "custom" },
          [architect]: { name: "architect" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const architectIdx = keys.indexOf(architect)
        const technicalLeadIdx = keys.indexOf(technicalLead)
        expect(architectIdx).toBeLessThan(technicalLeadIdx)
        expect(architectIdx).toBe(0)
      })

      test("#when only engineer and product-manager present #then orders as engineer→product-manager", () => {
        // given
        const agents: Record<string, unknown> = {
          [product-manager]: { name: "product-manager" },
          custom: { name: "custom" },
          [engineer]: { name: "engineer" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const engineerIdx = keys.indexOf(engineer)
        const productManagerIdx = keys.indexOf(productManager)
        expect(engineerIdx).toBeLessThan(productManagerIdx)
        expect(engineerIdx).toBe(0)
      })
    })

    describe("#given order field injection", () => {
      test("#when core agent is object #then injects order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [architect]: { name: "architect", mode: "primary" },
          [engineer]: { name: "engineer", mode: "primary" },
          [product-manager]: { name: "product-manager", mode: "primary" },
          [technical-lead]: { name: "technical-lead", mode: "primary" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[architect]).toEqual({ name: "architect", mode: "primary", order: 1 })
        expect(result[engineer]).toEqual({ name: "engineer", mode: "primary", order: 2 })
        expect(result[product-manager]).toEqual({ name: "product-manager", mode: "primary", order: 3 })
        expect(result[technical-lead]).toEqual({ name: "technical-lead", mode: "primary", order: 4 })
      })

      test("#when core agent is non-object #then leaves value unchanged", () => {
        // given
        const agents: Record<string, unknown> = {
          [architect]: "string-config",
          [technicalLead]: null,
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[architect]).toBe("string-config")
        expect(result[technicalLead]).toBe(null)
      })

      test("#when non-core agent #then does NOT inject order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [strategist]: { name: "strategist", mode: "subagent" },
          custom: { name: "custom" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[strategist]).toEqual({ name: "strategist", mode: "subagent" })
        expect(result.custom).toEqual({ name: "custom" })
      })
    })

    describe("#given non-core agent ordering", () => {
      test("#when multiple non-core agents #then sorted alphabetically after core agents", () => {
        // given: non-core agents in random order
        const agents: Record<string, unknown> = {
          zebra: { name: "zebra" },
          [architect]: { name: "architect" },
          apple: { name: "apple" },
          mango: { name: "mango" },
          [technical-lead]: { name: "technical-lead" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then: core agents first, then alphabetical
        const keys = Object.keys(result)
        expect(keys.slice(0, 2)).toEqual([architect, technicalLead])
        expect(keys.slice(2)).toEqual(["apple", "mango", "zebra"])
      })
    })
  })
})
