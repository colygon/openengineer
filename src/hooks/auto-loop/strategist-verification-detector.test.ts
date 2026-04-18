/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test"
import {
	extractStrategistSessionID,
	isStrategistVerified,
	parseStrategistVerificationEvidence,
} from "./strategist-verification-detector"
import { ULTRAWORK_VERIFICATION_PROMISE } from "./constants"

describe("parseStrategistVerificationEvidence", () => {
	test("#given valid strategist verification text #then should parse all fields", () => {
		// #given
		const text = `Task completed.

Agent: strategist

<promise>VERIFIED</promise>

<task_metadata>
session_id: ses_strategist_123
</task_metadata>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("strategist")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBe("ses_strategist_123")
	})

	test("#given text without agent line #then should return undefined", () => {
		// #given
		const text = `<promise>VERIFIED</promise>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text without promise tag #then should return undefined", () => {
		// #given
		const text = `Agent: strategist`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text with empty agent #then should return undefined", () => {
		// #given
		const text = `Agent:   

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text with empty promise #then should return undefined", () => {
		// #given
		const text = `Agent: strategist

<promise>   </promise>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text without metadata #then should parse agent and promise only", () => {
		// #given
		const text = `Agent: strategist

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("strategist")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBeUndefined()
	})

	test("#given text with metadata but no session_id #then should parse agent and promise only", () => {
		// #given
		const text = `Agent: strategist

<promise>VERIFIED</promise>

<task_metadata>
other_field: value
</task_metadata>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("strategist")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBeUndefined()
	})

	test("#given empty text #then should return undefined", () => {
		// #given
		const text = ""

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given whitespace-only text #then should return undefined", () => {
		// #given
		const text = "   \n\t  "

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given agent with different casing #then should preserve original case", () => {
		// #given
		const text = `Agent: STRATEGIST

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseStrategistVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("STRATEGIST")
	})
})

describe("isStrategistVerified", () => {
	test("#given valid strategist verification #then should return true", () => {
		// #given
		const text = `Agent: strategist

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isStrategistVerified(text)

		// #then
		expect(result).toBe(true)
	})

	test("#given non-strategist agent #then should return false", () => {
		// #given
		const text = `Agent: architect

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isStrategistVerified(text)

		// #then
		expect(result).toBe(false)
	})

	test("#given wrong promise #then should return false", () => {
		// #given
		const text = `Agent: strategist

<promise>DONE</promise>`

		// #when
		const result = isStrategistVerified(text)

		// #then
		expect(result).toBe(false)
	})

	test("#given strategist agent with different casing #then should return true", () => {
		// #given
		const text = `Agent: STRATEGIST

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isStrategistVerified(text)

		// #then
		expect(result).toBe(true)
	})

	test("#given empty text #then should return false", () => {
		// #given
		const text = ""

		// #when
		const result = isStrategistVerified(text)

		// #then
		expect(result).toBe(false)
	})
})

describe("extractStrategistSessionID", () => {
	test("#given valid strategist verification with session_id #then should return session_id", () => {
		// #given
		const text = `Agent: strategist

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_strategist_123
</task_metadata>`

		// #when
		const sessionID = extractStrategistSessionID(text)

		// #then
		expect(sessionID).toBe("ses_strategist_123")
	})

	test("#given valid strategist verification without session_id #then should return undefined", () => {
		// #given
		const text = `Agent: strategist

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const sessionID = extractStrategistSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given non-strategist agent #then should return undefined", () => {
		// #given
		const text = `Agent: architect

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_sis_123
</task_metadata>`

		// #when
		const sessionID = extractStrategistSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given non-strategist agent with different casing #then should return undefined", () => {
		// #given
		const text = `Agent: ARCHITECT

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_sis_123
</task_metadata>`

		// #when
		const sessionID = extractStrategistSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given empty text #then should return undefined", () => {
		// #given
		const text = ""

		// #when
		const sessionID = extractStrategistSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})
})
