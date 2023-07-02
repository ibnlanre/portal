import { useState, useEffect, type Reducer } from "react";

import { usePortalEntries, type Initial, type PortalState } from "../entries";
import { isFunction, objectToStringKey, updateState } from "../utilities";
import { BehaviorSubject } from "rxjs";

export function usePortalImplementation<S, A>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const { entries, addItemToEntries } = usePortalEntries<S, A>();
  const stringKey = objectToStringKey(key);

  try {
    const [subject] = useState<BehaviorSubject<S>>(() => {
      const computedState =
        initialState instanceof Promise
          ? undefined
          : isFunction(initialState)
          ? initialState()
          : initialState;
      return new BehaviorSubject(computedState as S);
    });

    useEffect(() => {
      const abortController = new AbortController();

      if (initialState instanceof Promise) {
        const isSubscribed = !abortController.signal.aborted;
        initialState
          .then((value) => {
            if (isSubscribed) subject.next(value);
          })
          .catch((error) => {
            if (isSubscribed) console.error("Error occurred:", error);
          });
      }

      return () => {
        abortController.abort();
      };
    }, [initialState, subject]);

    const entry = entries.get(stringKey)?.observable;
    const observable = (entry as BehaviorSubject<S>) ?? subject;
    const [state, setState] = useState(observable.value);

    useEffect(() => {
      if (!entries.has(stringKey)) {
        addItemToEntries(stringKey, { observable, reducer });
      }
      const subscriber = observable.subscribe(setState);
      // Unsubscribes when the component unmounts from the DOM
      return subscriber.unsubscribe;
    }, []);

    const dispatch = entries?.get(stringKey)?.reducer ?? reducer;
    const setter = updateState<S, A>(observable, state, dispatch);
    return [state, setter];
  } catch (e) {
    if (!entries) {
      throw new Error("usePortal must be used within a PortalProvider");
    }
  }

  return [] as any;
}
