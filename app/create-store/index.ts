import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { InferSchema } from "@/create-store/types/infer-schema";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StandardSchema } from "@/create-store/types/schema";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isObjectSchema } from "@/create-store/functions/assertions/is-object-schema";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveSchema } from "@/create-store/functions/utilities/resolve-schema";

/**
 * Creates a composite store from a schema whose output is a plain object.
 * Every property in the schema becomes a nested store node, accessible via
 * dot notation and the `$at` path accessor.
 *
 * @example
 * ```ts
 * const count = createStore(
 *   z.object({
 *     value: z.number().default(0),
 *     label: z.string().default("count"),
 *   })
 * );
 *
 * count.value.$get(); // 0
 * count.value.$set((n) => n + 1);
/**
 * Creates a store from a Standard Schema. If the schema's output is a plain
 * object dictionary, a composite store is returned with nested store nodes per
 * key; otherwise a primitive store is returned.
 *
 * @example
 * ```ts
 * const count = createStore(z.number().default(0));
 * count.$get(); // 0
 * count.$set((n) => n + 1);
 * ```
 *
 * @example
 * ```ts
 * const store = createStore(
 *   z.object({
 *     value: z.number().default(0),
 *     label: z.string().default("count"),
 *   })
 * );
 *
 * store.value.$get(); // 0
 * store.label.$get(); // "count"
 * ```
 */
export function createStore<Schema extends StandardSchema>(
  schema: Schema
): InferSchema<Schema> extends Dictionary
  ? CompositeStore<InferSchema<Schema>>
  : PrimitiveStore<InferSchema<Schema>>;
export function createStore<Schema extends StandardSchema>(schema: Schema) {
  const state = resolveSchema(schema);

  if (isDictionary(state) || isObjectSchema(schema)) {
    return createCompositeStore((state ?? {}) as Dictionary);
  }

  return createPrimitiveStore(state);
}
