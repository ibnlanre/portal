import { useEffect } from "react";

import { usePortalImplementation } from "./withImplementation";
import type { PortalState } from "entries";
import type { Atom } from "component";

export function usePortalWithAtomStorage<S, A = undefined>(
  store: Atom<S, A>
): PortalState<S, A> {
  const { key, storedState, reducer } = store.destructure();
  const [state, setState] = usePortalImplementation<S, A>(
    key,
    storedState,
    reducer
  );

  useEffect(() => {
    store.setItem(state);
  }, [state]);

  return [state, setState];
}
