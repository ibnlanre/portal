import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Factory } from "@/create-store/types/factory";
import type { Initializer } from "@/create-store/types/initializer";
import type { Possible } from "@/create-store/types/possible";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveValue } from "@/create-store/functions/utilities/resolve-value";

/**
 * Creates a composite store from an initial state that is a plain object.
 * Every property becomes a nested store node, accessible via dot notation and
 * the `$at` path accessor. Function properties are exposed directly as methods.
 *
 * The state may also be a factory, so the initial value is produced lazily on
 * first call instead of eagerly.
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
export function createStore<State extends Dictionary>(
  initialState: Factory<State>
): CompositeStore<State>;
/**
 * Creates a primitive store from an async initializer, or from a Promise of a
 * value. Returns a Promise for the store, so `await` it before reading.
 *
 * The resolved value is held by a primitive store. An initializer that resolves
 * to a plain object therefore wraps that object rather than creating nested
 * nodes, so await the data first when you want a composite store.
 *
 * @example
 * ```ts
 * const fetchCount = async () => {
 *   const response = await fetch("https://api.example.com/count");
 *   const data = await response.json();
 *   return data.count;
 * };
 *
 * const count = await createStore(fetchCount);
 * count.$get();
 * count.$set(78);
 * ```
 */
export function createStore<State>(
  initialState: Initializer<Promise<State>> | Promise<State>
): Promise<PrimitiveStore<State>>;
/**
 * Creates a primitive store from an initial value that is not a plain object.
 * The store holds a single value accessible and updatable via `$get`, `$set`,
 * `$use`, and `$subscribe`.
 *
 * The value may also be a factory, so it is produced lazily on first call.
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
export function createStore<State>(
  initialState: Factory<State>
): PrimitiveStore<State>;
/**
 * Creates a primitive store with no initial value. The store is typed
 * `State | undefined` until you set a value.
 *
 * @example
 * ```ts
 * const count = createStore<number>();
 * count.$get(); // undefined
 * ```
 */
export function createStore<State>(
  initialState?: Possible<Factory<State | undefined>>
): PrimitiveStore<State | undefined>;
/**
 * Creates a store from an initial value. A factory is resolved first and an
 * async initializer is awaited, then the resolved value dispatches to a
 * composite store when it is a plain object and a primitive store otherwise.
 */
export function createStore<State>(initialState?: State) {
  const state = resolveValue(initialState);

  if (isPromise<State>(state)) {
    return state.then((resolved) => createPrimitiveStore(resolved));
  }

  if (isDictionary(state)) return createCompositeStore(state);

  return createPrimitiveStore(state);
}
