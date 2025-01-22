import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";

export function createCompositeStore<State extends Dictionary>(
  initialState: State
): CompositeStore<State> {
  const clone = createSnapshot(initialState);

  for (const key in clone) {
    const property = clone[key];

    if (isDictionary(property)) {
      clone[key] = <any>createCompositeStore(property);
    } else {
      clone[key] = <any>createPrimitiveStore(property);
    }
  }

  const store = createPrimitiveStore(initialState);
  return <any>shallowMerge(clone, store);
}

const store = createCompositeStore({
  location: {
    address: {
      street: "123 Main St",
    },
  },
});

store.location.$get();

function $get() {}
