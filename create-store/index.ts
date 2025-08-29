import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Factory } from "@/create-store/types/factory";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Initializer } from "@/create-store/types/initializer";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Reference } from "@/create-store/types/reference";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveValue } from "@/create-store/functions/utilities/resolve-value";

/**
 * @example
 *
 * ```ts
 * const count = createStore({
 *   value: 0,
 *   increase(amount: number = 1) {
 *     count.value.$set((state) => state + amount);
 *   },
 *   decrease(amount: number = 1) {
 *     count.value.$set((state) => state - amount);
 *   },
 * });
 *
 * count.increase(4);
 * ```
 */
export function createStore<State extends Dictionary>(
  state: Factory<State>
): CompositeStore<State>;

/**
 * @example
 *
 * ```ts
 * const fetchCount = async () => {
 *  const result = await fetch("https://api.example.com/count");
 *  const data = await result.json();
 *  return data.count;
 * };
 *
 * const count = await createStore(fetchCount);
 * ```
 */
export function createStore<State>(
  state: Initializer<Promise<State>>
): Promise<PrimitiveStore<State>>;

/**
 * @example
 *
 * ```ts
 * const userStore = createStore([
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" },
 * ]);
 * ```
 */
export function createStore<State extends Reference>(
  state: Factory<State>
): PrimitiveStore<State>;

/**
 * @example
 *
 * ```ts
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * const userStore = createStore<User>({
 *   name: "John Doe",
 *   age: 30,
 * });
 * ```
 */
export function createStore<State extends GenericObject>(
  state: Factory<State>
): CompositeStore<State>;

/**
 * @example
 *
 * ```ts
 * const count = createStore(0);
 * count.$get(); // 0
 *
 * const count = createStore();
 * count.$get(); // undefined
 * ```
 */
export function createStore<State = undefined>(
  state?: Factory<State>
): PrimitiveStore<State>;

export function createStore<State>(initialState?: State) {
  const state = resolveValue(initialState);

  if (isPromise<State>(state)) {
    return state.then((resolved) => createPrimitiveStore(resolved));
  }

  if (isDictionary(state)) {
    return createCompositeStore(state);
  }

  return createPrimitiveStore(state);
}
