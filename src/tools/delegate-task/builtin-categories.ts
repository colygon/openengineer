import type { CategoryConfig } from "../../config/schema"
import type { BuiltinCategoryDefinition } from "./builtin-category-definition"
import { NEBIUS_CATEGORIES } from "./nebius-categories"

const BUILTIN_CATEGORIES: BuiltinCategoryDefinition[] = [
  ...NEBIUS_CATEGORIES,
]

function buildCategoryRecord<TValue>(
  selector: (definition: BuiltinCategoryDefinition) => TValue
): Record<string, TValue> {
  return Object.fromEntries(
    BUILTIN_CATEGORIES.map((definition) => [definition.name, selector(definition)])
  )
}

export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = buildCategoryRecord(
  (definition) => definition.config
)

export const CATEGORY_PROMPT_APPENDS: Record<string, string> = buildCategoryRecord(
  (definition) => definition.promptAppend
)

export const CATEGORY_DESCRIPTIONS: Record<string, string> = buildCategoryRecord(
  (definition) => definition.description
)
