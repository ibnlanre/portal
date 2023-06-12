import { useState, useEffect, useRef } from "react";
import type { Reducer, SetStateAction, Dispatch } from "react";
import { BehaviorSubject, Subscription } from "rxjs";

import { usePortalEntries } from "../entries";
import { usePortalReducers } from "../reducers";
import { updateState } from "../utilities";

/**
 * @template S
 * @template A
 * @typedef {Dispatch<A | SetStateAction<S>>} Dispatcher
 */
export type Dispatcher<S, A> = A extends undefined
  ? Dispatch<SetStateAction<S>>
  : Dispatch<A>;

/**
 * @template S
 * @template A
 * @typedef {typeof initialState, Dispatcher<S, A>} UsePortalResult
 */
export type UsePortalResult<S, A = undefined> = [S, Dispatcher<S, A>];

export function usePortalImplementation<S, A>(
  key: string,
  initialState?: S,
  reducer?: Reducer<S, A>,
  store?: Storage
): UsePortalResult<S, A> {
  const [entries, setEntries] = usePortalEntries<string, BehaviorSubject<S>>();
  const [reducers, setReducers] = usePortalReducers<S, A>();
  const [state, setState] = useState(initialState as S);

  try {
    const subjectRef = useRef<BehaviorSubject<S>>();

    useEffect(() => {
      const storedState = store?.getItem(key);
      const parsedState: S = storedState
        ? JSON.parse(storedState)
        : initialState;
      subjectRef.current = new BehaviorSubject(parsedState);

      if (!entries.has(key)) setEntries(key, subjectRef.current);
      if (reducer && !reducers.has(key)) setReducers(key, reducer);
    }, []);

    const observable = entries.get(key) ?? subjectRef.current!;
    const subscriptionRef = useRef<Subscription>();

    useEffect(() => {
      subscriptionRef.current = observable.subscribe((value) => {
        setState(value);
        store?.setItem(key, JSON.stringify(value));
      });
      // Unsubscribes when the component unmounts from the DOM
      return () => subscriptionRef.current?.unsubscribe();
    }, []);

    const dispatch = reducers.get(key) ?? reducer;
    const setter = updateState<S, A>(observable, state, dispatch);
    return [state, setter];
  } catch (e) {
    if (!entries) {
      throw new Error("usePortalEntries must be used within a PortalProvider");
    }

    if (!reducers) {
      throw new Error("usePortalReducers must be used within a PortalProvider");
    }
  }

  return [state, setState as Dispatcher<S, A>];
}
