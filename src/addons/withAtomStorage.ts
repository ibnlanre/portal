import { usePortalImplementation } from "./withImplementation";
import type { Atomic, PortalState } from "entries";

export function usePortalWithAtomStorage<S, A = undefined>(
  store: Atomic<S, A>,
  isolate: boolean = true
): PortalState<S, A> {
  const { key, reducer, storedState, subject } = store.destructure();

  const [state, setState] = usePortalImplementation<S, A>({
    key,
    initialState: storedState,
    reducer,
    override: true,
    atom: subject,
    isolate,
  });

  return [state, setState];
}
