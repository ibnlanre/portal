import { usePortalImplementation } from "./withImplementation";
import type { Atomic, PortalState } from "entries";

export function usePortalWithAtomStorage<S, A = undefined>(
  store: Atomic<S, A>,
  isolate: boolean = true
): PortalState<S, A> {
  const { key, reducer, storedState } = store.destructure();

  const [state, setState] = usePortalImplementation<S, A>({
    key,
    initialState: storedState,
    reducer,
    override: true,
    atom: store,
    isolate,
  });

  return [state, setState];
}
