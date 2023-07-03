import { useState, useEffect, type Reducer, useMemo } from "react";

import {
  usePortalEntries,
  type Initial,
  type PortalState,
  PortalEntry,
} from "../entries";
import { objectToStringKey, updateState, getComputedState } from "../utilities";
import { BehaviorSubject } from "../subject";

export function usePortalImplementation<S, A>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const { entries, addItemToEntries } = usePortalEntries<S, A>();
  const stringKey = objectToStringKey(key);

  if (!entries) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  const subject = useMemo<PortalEntry<S, A>>(() => {
    if (entries.has(stringKey)) {
      return entries.get(stringKey) as PortalEntry<S, A>;
    }

    return {
      observable: new BehaviorSubject(undefined as S),
      reducer,
    };
  }, [entries]);

  const [state, setState] = useState(subject.observable.value);

  useEffect(() => {
    if (!entries.has(stringKey)) addItemToEntries(stringKey, subject);
    const subscriber = subject.observable.subscribe(setState);

    // Unsubscribes when the component unmounts from the DOM
    return subscriber.unsubscribe;
  }, [subject]);

  useEffect(() => {
    const computedState = async () => {
      const state = await getComputedState(initialState);
      subject.observable.next(state as S);
    };
    computedState();
  }, [subject]);

  const setter = updateState<S, A>(subject.observable, state, subject.reducer);
  return [state, setter];
}
