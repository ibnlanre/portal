import type { CompositeStore } from "@/create-store/types/composite-store";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";

/**
 * Creates a composite store from an initial state that is a plain object.
 * Every property becomes a nested store node, accessible via dot notation and
 * the `$at` path accessor. Function properties are exposed directly as methods.
 *
 * @example
 * ```ts
 * const count = createStore({
 *   value: 0,
 *   increment: () => count.value.$set((n) => n + 1),
 * });
 *
 * count.value.$get(); // 0
 * count.increment();
 * ```
 */
export function createStore<State extends GenericObject>(
  initialState: State
): CompositeStore<State>;
/**
 * Creates a primitive store from an initial value that is not a plain object.
 * The store holds a single value accessible and updatable via `$get`, `$set`,
 * `$use`, and `$subscribe`.
 *
 * @example
 * ```ts
 * const count = createStore(0);
 * count.$get(); // 0
 * count.$set((n) => n + 1);
 * ```
 *
 * @example
 * ```ts
 * const label = createStore("count");
 * label.$get(); // "count"
 * label.$set("total");
 * ```
 */
export function createStore<State>(initialState: State): PrimitiveStore<State>;
/**
 * Creates a store from an initial value, dispatching to a composite store when
 * the value is a plain object and a primitive store otherwise.
 */
export function createStore<State>(initialState: State) {
  if (isDictionary(initialState)) return createCompositeStore(initialState);
  return createPrimitiveStore(initialState);
}
