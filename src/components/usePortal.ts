import { ReducerState, useEffect, useRef, useState } from "react";
import type { Reducer, Dispatch, SetStateAction } from "react";
import { BehaviorSubject, Subscription } from "rxjs";

import { usePortalEntries } from "../entries";
import { usePortalReducers } from "../reducers";
import { updateState } from "../utilities";

/**
 *
 * Custom hook for creating a portal with basic state management.
 * @param key - Unique key identifier for the portal.
 * @param initialState - Optional initial state of the portal.
 * @returns A tuple containing the state and dispatch function for updating the state using setState.
 */
export function usePortal<S>(
  key: string,
  initialState?: S
): [S, Dispatch<SetStateAction<S>>];

/**
 *
 * Custom hook for creating a portal with an optional reducer to update the state.
 * @param key - Unique key identifier for the portal.
 * @param initialState - Initial state of the portal, which could be a reducer state.
 * @param reducer - Optional reducer function to handle state updates.
 * @returns A tuple containing the state and dispatch function for updating the state.
 */
export function usePortal<S, A>(
  key: string,
  initialState: S & ReducerState<Reducer<S, A>>,
  reducer?: Reducer<S, A>
): [typeof initialState, Dispatch<A>];

/**
 *
 * @description Implementation for custom usePortal hook
 */
export function usePortal<S, A>(
  key: string,
  initialState: S & ReducerState<Reducer<S, A>>,
  reducer?: Reducer<S, A>
) {
  const [entries, setEntries] = usePortalEntries<string, BehaviorSubject<S>>();
  const [reducers, setReducers] = usePortalReducers<S, A>();

  try {
    const subject = new BehaviorSubject(initialState as S);
    const observable = entries.get(key) ?? subject;
    const dispatch = reducers.get(key) ?? reducer;

    const [state, setState] = useState(initialState as S);
    const subRef = useRef<Subscription>();

    useEffect(() => {
      if (!entries.has(key)) setEntries(key, observable);
      if (reducer && !reducers.has(key)) setReducers(key, reducer);
    }, []);

    useEffect(() => {
      subRef.current = observable.subscribe(setState);

      // Unsubscribes when the component unmounts from the DOM
      return () => subRef.current?.unsubscribe();
    }, []);

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

  return [];
}
