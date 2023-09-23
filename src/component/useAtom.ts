import { useEffect, useMemo, useState } from "react";
import type { Atom, PortalEntry, PortalState } from "definition";

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<S, A = undefined>(
  store: Atom<S, A> & { value: PortalEntry<S, A> }
): PortalState<S, A> {
  const subject = store.value;
  const [state, setState] = useState(subject.observable.value);

  useEffect(() => {
    const subscriber = subject.observable.subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  const setter = useMemo(() => {
    return subject.observable.watch(subject.reducer);
  }, [subject]);
  return [state, setter];
}
