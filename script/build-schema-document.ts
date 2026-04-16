import { z } from "zod"
import { OhMyOpenCodeConfigSchema } from "../src/config/schema"

export function createOhMyOpenCodeJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(OhMyOpenCodeConfigSchema, {
    target: "draft-7",
    unrepresentable: "any",
  }) as Record<string, unknown>

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/openengineer.schema.json",
    title: "Open Engineer Configuration",
    description: "Configuration schema for openengineer plugin",
    ...jsonSchema,
  }
}
