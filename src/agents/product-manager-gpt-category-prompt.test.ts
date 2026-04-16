declare const require: (name: string) => any
const { describe, expect, test } = require("bun:test")
import { PRODUCT_MANAGER_GPT_SYSTEM_PROMPT } from "./product-manager/gpt"

describe("PRODUCT_MANAGER_GPT_SYSTEM_PROMPT category guidance", () => {
	test("#given recommended agent profile instructions #when reading category placeholder #then it must point planners at available categories rather than a free-form name", () => {
		//#given
		const prompt = PRODUCT_MANAGER_GPT_SYSTEM_PROMPT

		//#when / #then
		expect(prompt).not.toContain("Category: `[name]`")
		expect(prompt).toContain("Category: `[category-from-available-categories-above]`")
	})
})
