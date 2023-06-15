import { useState, useEffect, type Reducer } from "react";
import { BehaviorSubject } from "rxjs";

import {
  usePortalEntries,
  type Initial,
  type UsePortalResult,
} from "../entries";
import { isFunction, updateState } from "../utilities";

export function usePortalImplementation<S, A>(
  key: string,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): UsePortalResult<S, A> {
  const { entries, addItemToEntries } = usePortalEntries<S, A>();

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
      let isSubscribed = true;

      if (initialState instanceof Promise) {
        initialState.then((value) => {
          if (isSubscribed) subject.next(value);
        });
      }

      return () => {
        isSubscribed = false;
      };
    }, [initialState, subject]);

    const observable = entries.get(key)?.observable ?? subject;
    const [state, setState] = useState(observable.getValue());

    useEffect(() => {
      if (!entries.has(key)) {
        addItemToEntries(key, { observable, reducer });
      }
    }, []);

    useEffect(() => {
      const subscription = observable.subscribe(setState);

      // Unsubscribes when the component unmounts from the DOM
      return () => subscription?.unsubscribe();
    }, []);

    const dispatch = entries?.get(key)?.reducer ?? reducer;
    const setter = updateState<S, A>(observable, state, dispatch);
    return [state, setter];
  } catch (e) {
    if (!entries) {
      throw new Error("usePortal must be used within a PortalProvider");
    }
  }

  return [] as any;
}
