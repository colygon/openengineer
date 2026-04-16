import { describe, expect, test } from "bun:test"
import { mkdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createToolExecuteAfterHandler } from "./tool-execute-after"
import { createToolExecuteBeforeHandler } from "./tool-execute-before"
import { ULTRAWORK_VERIFICATION_PROMISE } from "../hooks/ralph-loop/constants"
import { clearState, readState, writeState } from "../hooks/ralph-loop/storage"

describe("tool.execute.before ultrawork strategist verification", () => {
	function createCtx(directory: string) {
		return {
			directory,
			client: {
				session: {
					messages: async () => ({ data: [] }),
				},
			},
		}
	}

	function createStrategistTaskArgs(prompt: string): Record<string, unknown> {
		return {
			subagent_type: "strategist",
			run_in_background: true,
			prompt,
		}
	}

	function createSyncTaskMetadata(
		args: Record<string, unknown>,
		sessionId: string,
	): Record<string, unknown> {
		return {
			prompt: args.prompt,
			agent: "strategist",
			run_in_background: args.run_in_background,
			sessionId,
			sync: true,
		}
	}

	test("#given ulw loop is awaiting verification #when strategist task runs #then strategist prompt is enforced and sync", async () => {
		const directory = join(tmpdir(), `tool-before-ulw-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		writeState(directory, {
			active: true,
			iteration: 3,
			completion_promise: ULTRAWORK_VERIFICATION_PROMISE,
			initial_completion_promise: "DONE",
			started_at: new Date().toISOString(),
			prompt: "Ship feature",
			session_id: "ses-main",
			ultrawork: true,
			verification_pending: true,
		})

		const handler = createToolExecuteBeforeHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteBeforeHandler>[0]["hooks"],
		})
		const output = { args: createStrategistTaskArgs("Check it") }

		await handler({ tool: "task", sessionID: "ses-main", callID: "call-1" }, output)

		expect(readState(directory)?.verification_attempt_id).toBeTruthy()
		expect(output.args.run_in_background).toBe(false)
		expect(output.args.prompt).toContain("Original task:")
		expect(output.args.prompt).toContain("Ship feature")
		expect(output.args.prompt).toContain("Review the work skeptically and critically")
		expect(output.args.prompt).toContain(`<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`)

		clearState(directory)
		rmSync(directory, { recursive: true, force: true })
	})

	test("#given ulw loop is not awaiting verification #when strategist task runs #then prompt is unchanged", async () => {
		const directory = join(tmpdir(), `tool-before-ulw-${Date.now()}-plain`)
		mkdirSync(directory, { recursive: true })
		const handler = createToolExecuteBeforeHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteBeforeHandler>[0]["hooks"],
		})
		const output = { args: createStrategistTaskArgs("Check it") }

		await handler({ tool: "task", sessionID: "ses-main", callID: "call-1" }, output)

		expect(output.args.run_in_background).toBe(true)
		expect(output.args.prompt).toBe("Check it")

		rmSync(directory, { recursive: true, force: true })
	})

	test("#given ulw-loop skill invocation carries user_message #when tool.execute.before runs #then the loop starts with that prompt", async () => {
		const directory = join(tmpdir(), `tool-before-ulw-skill-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		const startLoopCalls: Array<{ sessionID: string; prompt: string; options: Record<string, unknown> }> = []
		const handler = createToolExecuteBeforeHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["ctx"],
			hooks: {
				ralphLoop: {
					startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
						startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
						return true
					},
					cancelLoop: () => true,
					getState: () => null,
				},
			} as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["hooks"],
		})
		const output = {
			args: {
				name: "ulw-loop",
				user_message: '"Ship feature" --strategy=continue',
			},
		}

		await handler({ tool: "skill", sessionID: "ses-main", callID: "call-skill-ulw" }, output)

		expect(startLoopCalls).toHaveLength(1)
		expect(startLoopCalls[0]).toEqual({
			sessionID: "ses-main",
			prompt: "Ship feature",
			options: {
				ultrawork: true,
				maxIterations: undefined,
				completionPromise: undefined,
				strategy: "continue",
			},
		})

		rmSync(directory, { recursive: true, force: true })
	})

	test("#given ulw loop is awaiting verification #when strategist sync task metadata is persisted #then strategist session id is stored", async () => {
		const directory = join(tmpdir(), `tool-after-ulw-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		writeState(directory, {
			active: true,
			iteration: 3,
			completion_promise: ULTRAWORK_VERIFICATION_PROMISE,
			initial_completion_promise: "DONE",
			started_at: new Date().toISOString(),
			prompt: "Ship feature",
			session_id: "ses-main",
			ultrawork: true,
			verification_pending: true,
		})

		const beforeHandler = createToolExecuteBeforeHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteBeforeHandler>[0]["hooks"],
		})
		const beforeOutput = { args: createStrategistTaskArgs("Check it") }
		await beforeHandler({ tool: "task", sessionID: "ses-main", callID: "call-1" }, beforeOutput)
		const metadataFromSyncTask = createSyncTaskMetadata(beforeOutput.args, "ses-strategist")

		const handler = createToolExecuteAfterHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteAfterHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteAfterHandler>[0]["hooks"],
		})

		await handler(
			{ tool: "task", sessionID: "ses-main", callID: "call-1" },
			{
				title: "strategist task",
				output: "done",
				metadata: metadataFromSyncTask,
			},
		)

		expect(readState(directory)?.verification_session_id).toBe("ses-strategist")

		clearState(directory)
		rmSync(directory, { recursive: true, force: true })
	})

	test("#given ulw loop is awaiting verification #when strategist metadata prompt is missing #then strategist session fallback is stored", async () => {
		const directory = join(tmpdir(), `tool-after-ulw-fallback-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		writeState(directory, {
			active: true,
			iteration: 3,
			completion_promise: ULTRAWORK_VERIFICATION_PROMISE,
			initial_completion_promise: "DONE",
			started_at: new Date().toISOString(),
			prompt: "Ship feature",
			session_id: "ses-main",
			ultrawork: true,
			verification_pending: true,
		})

		const handler = createToolExecuteAfterHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteAfterHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteAfterHandler>[0]["hooks"],
		})

		await handler(
			{ tool: "task", sessionID: "ses-main", callID: "call-1" },
			{
				title: "strategist task",
				output: "done",
				metadata: {
					agent: "strategist",
					sessionId: "ses-strategist-fallback",
					sync: true,
				},
			},
		)

		expect(readState(directory)?.verification_session_id).toBe("ses-strategist-fallback")

		clearState(directory)
		rmSync(directory, { recursive: true, force: true })
	})

	test("#given ulw loop is awaiting verification #when strategist metadata uses sessionID #then strategist session id is stored", async () => {
		const directory = join(tmpdir(), `tool-after-ulw-sessionid-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		writeState(directory, {
			active: true,
			iteration: 3,
			completion_promise: ULTRAWORK_VERIFICATION_PROMISE,
			initial_completion_promise: "DONE",
			started_at: new Date().toISOString(),
			prompt: "Ship feature",
			session_id: "ses-main",
			ultrawork: true,
			verification_pending: true,
		})

		const handler = createToolExecuteAfterHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteAfterHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteAfterHandler>[0]["hooks"],
		})

		await handler(
			{ tool: "task", sessionID: "ses-main", callID: "call-1" },
			{
				title: "strategist task",
				output: "done",
				metadata: {
					agent: "strategist",
					sessionID: "ses-strategist-alt",
					sync: true,
				},
			},
		)

		expect(readState(directory)?.verification_session_id).toBe("ses-strategist-alt")

		clearState(directory)
		rmSync(directory, { recursive: true, force: true })
	})

	test("#given newer strategist attempt exists #when older strategist task finishes #then old session does not overwrite active verification", async () => {
		const directory = join(tmpdir(), `tool-race-ulw-${Date.now()}`)
		mkdirSync(directory, { recursive: true })
		writeState(directory, {
			active: true,
			iteration: 3,
			completion_promise: ULTRAWORK_VERIFICATION_PROMISE,
			initial_completion_promise: "DONE",
			started_at: new Date().toISOString(),
			prompt: "Ship feature",
			session_id: "ses-main",
			ultrawork: true,
			verification_pending: true,
		})

		const beforeHandler = createToolExecuteBeforeHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteBeforeHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteBeforeHandler>[0]["hooks"],
		})
		const afterHandler = createToolExecuteAfterHandler({
			ctx: createCtx(directory) as unknown as Parameters<typeof createToolExecuteAfterHandler>[0]["ctx"],
			hooks: {} as Parameters<typeof createToolExecuteAfterHandler>[0]["hooks"],
		})

		const firstOutput = { args: createStrategistTaskArgs("Check it") }
		await beforeHandler({ tool: "task", sessionID: "ses-main", callID: "call-1" }, firstOutput)
		const firstAttemptId = readState(directory)?.verification_attempt_id

		const secondOutput = { args: createStrategistTaskArgs("Check it again") }
		await beforeHandler({ tool: "task", sessionID: "ses-main", callID: "call-2" }, secondOutput)
		const secondAttemptId = readState(directory)?.verification_attempt_id

		expect(firstAttemptId).toBeTruthy()
		expect(secondAttemptId).toBeTruthy()
		expect(secondAttemptId).not.toBe(firstAttemptId)

		await afterHandler(
			{ tool: "task", sessionID: "ses-main", callID: "call-1" },
			{
				title: "strategist task",
				output: "done",
				metadata: {
					agent: "strategist",
					prompt: String(firstOutput.args.prompt),
					sessionId: "ses-strategist-old",
				},
			},
		)

		expect(readState(directory)?.verification_session_id).toBeUndefined()

		await afterHandler(
			{ tool: "task", sessionID: "ses-main", callID: "call-2" },
			{
				title: "strategist task",
				output: "done",
				metadata: {
					agent: "strategist",
					prompt: String(secondOutput.args.prompt),
					sessionId: "ses-strategist-new",
				},
			},
		)

		expect(readState(directory)?.verification_session_id).toBe("ses-strategist-new")

		clearState(directory)
		rmSync(directory, { recursive: true, force: true })
	})
})
