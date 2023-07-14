import { useState, useEffect, useMemo, type Reducer } from "react";

import { usePortalEntries } from "entries";
import { getComputedState, objectToStringKey, updateState } from "utilities";
import { BehaviorSubject } from "subject";

import type { Initial, PortalState, PortalEntry } from "entries";

export function usePortalImplementation<S, A>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>,
  override = false
): PortalState<S, A> {
  const { entries, addItemToEntries } = usePortalEntries<S, A>();
  const stringKey = objectToStringKey(key);

  if (!entries) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  const subject = useMemo<PortalEntry<S, A>>(() => {
    if (!override && entries.has(stringKey)) {
      return entries.get(stringKey) as PortalEntry<S, A>;
    }

    const state =
      initialState instanceof Promise
        ? undefined
        : getComputedState(initialState);

    return {
      observable: new BehaviorSubject(state as S),
      reducer,
    };
  }, [entries]);

  const [state, setState] = useState(subject.observable.value);

  useEffect(() => {
    if (!entries.has(stringKey)) addItemToEntries(stringKey, subject);
    const subscriber = subject.observable.subscribe(setState);

    if (initialState) {
      if (initialState instanceof Promise) {
        initialState.then(subject.observable.next);
      } else {
        const state = getComputedState(initialState);
        subject.observable.next(state);
      }
    }

    // Unsubscribes when the component unmounts from the DOM
    return subscriber.unsubscribe;
  }, [subject]);

  const setter = updateState<S, A>(subject.observable, state, subject.reducer);
  return [state, setter];
}
