import { useEffect, useMemo, useState } from "react";
import type { Atomic, PortalState } from "definition";

export function usePortalWithAtomStorage<S, A = undefined>(
  store: Atomic<S, A>
): PortalState<S, A> {
  const { subject } = store.props;
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
