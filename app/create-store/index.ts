import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { InferSchema } from "@/create-store/types/infer-schema";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
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
 * An optional `initialState` may be provided to bypass schema resolution
 * entirely — useful when the schema has no defaults but a concrete starting
 * value is already available.
 *
 * If the schema's `validate` function is asynchronous, the return value is a
 * `Promise` that resolves to the store. Await the result before using it.
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
 *
 * @example
 * ```ts
 * // Provide an explicit initial state when the schema has no defaults.
 * const store = createStore(z.object({ value: z.number() }), { value: 0 });
 * store.value.$get(); // 0
 * ```
 */
export function createStore<
  Schema extends StandardSchemaV1,
  State extends InferSchema<Schema>,
>(
  schema: Schema,
  initialState: State
): State extends Dictionary ? CompositeStore<State> : PrimitiveStore<State>;
export function createStore<Schema extends StandardSchemaV1>(
  schema: Schema
): InferSchema<Schema> extends Dictionary
  ? CompositeStore<InferSchema<Schema>>
  : PrimitiveStore<InferSchema<Schema>>;
export function createStore<
  Schema extends StandardSchemaV1,
  State extends InferSchema<Schema>,
>(schema: Schema, initialState?: State) {
  const dispatch = (state: InferSchema<Schema>) => {
    if (isDictionary(state)) return createCompositeStore(schema, state);
    return createPrimitiveStore(schema, state);
  };

  if (initialState !== undefined) return dispatch(initialState);

  const state = resolveSchema(schema);
  if (state instanceof Promise) return state.then(dispatch);
  return dispatch(state);
}
