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

export function createStore<State extends Dictionary>(
  state: Factory<State>
): CompositeStore<State>;

export function createStore<State>(
  state: Initializer<Promise<State>>
): Promise<PrimitiveStore<State>>;

export function createStore<State>(
  state: Factory<State>
): PrimitiveStore<State>;

export function createStore<State>(
  state?: Possible<Factory<State | undefined>>
): PrimitiveStore<State | undefined>;

export function createStore<State>(initialState?: State) {
  const state = resolveValue(initialState);
  if (isPromise<State>(state)) return state.then(createPrimitiveStore);
  if (isDictionary(state)) return createCompositeStore(state);
  return createPrimitiveStore(state);
}
