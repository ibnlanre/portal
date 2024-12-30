import type { Store } from "@/create-store/types/store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveValue } from "@/create-store/functions/utilities/resolve-value";

export const createStore: Store = <State>(initialState?: State) => {
  const state = resolveValue(initialState);
  if (isDictionary(state)) return createCompositeStore(state);
  return createPrimitiveStore(state);
};
