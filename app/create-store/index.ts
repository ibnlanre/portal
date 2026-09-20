import type { BuiltIn } from "@/create-store/types/built-in";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveValue } from "@/create-store/functions/utilities/resolve-value";

type CreatedStore<State> = 0 extends 1 & State
  ? PrimitiveStore<State>
  : [State] extends [Promise<infer Value>]
    ? Promise<PrimitiveStore<Value>>
    : [State] extends [BuiltIn]
      ? PrimitiveStore<State>
      : [State] extends [object]
        ? CompositeStore<State>
        : PrimitiveStore<State>;

/** Create a store from a synchronous factory, or await an async whole-value store. */
export function createStore<State>(
  initializer: () => State
): CreatedStore<State>;
/** Plain records become branch stores; arrays and built-ins remain whole values. */
export function createStore<State>(initialState: State): CreatedStore<State>;
/** With no initial value, reads include undefined until the value is supplied. */
export function createStore<State>(): PrimitiveStore<State | undefined>;
export function createStore<State>(initialState?: State) {
  const state = resolveValue(initialState);

  if (isPromise<State>(state)) {
    return state.then((resolved) => createPrimitiveStore(resolved));
  }

  if (isDictionary(state)) return createCompositeStore(state);

  return createPrimitiveStore(state);
}
