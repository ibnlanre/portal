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
 * @example
 *
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
 */
export function createStore<State extends Dictionary>(
  state: Factory<State>
): CompositeStore<State>;

/**
 * @example
 *
 * const fetchCount = async () => {
 *  const result = await fetch("https://api.example.com/count");
 *  const data = await result.json();
 *  return data.count;
 * };
 *
 * const count = await createStore(fetchCount);
 * count.$act((state) => console.log(state));
 * count.$set(78);
 */
export function createStore<State>(
  state: Initializer<Promise<State>>
): Promise<PrimitiveStore<State>>;

/**
 * @example
 *
 * const count = createStore(0);
 * count.$get(); // 0
 */
export function createStore<State>(
  state: Factory<State>
): PrimitiveStore<State>;

/**
 * @example
 *
 * const count = createStore<number>();
 */
export function createStore<State>(
  state?: Possible<Factory<State | undefined>>
): PrimitiveStore<State | undefined>;

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
