import { ReducerState, useEffect, useRef, useState } from "react";
import { Reducer, Dispatch, SetStateAction } from "react";
import { BehaviorSubject, Subscription } from "rxjs";
import { getPortalEntries, getPortalReducers } from ".";

/**
 *
 * Check if the provided value is a function.
 * @param v - Value to be checked.
 * @returns `true` if the value is a function, `false` otherwise.
 */
const isFunction = (v: any): v is Function => typeof v === "function";

/**
 *
 * Update the state of an observable using the provided value and dispatch function (optional).
 * @param observable - BehaviorSubject representing the state.
 * @param prevState - Previous state value.
 * @param dispatch - Optional reducer function to handle state updates.
 * @returns A function that takes a value or action and updates the state accordingly.
 */
function updateState<S, A>(
  observable: BehaviorSubject<S>,
  prevState: S,
  dispatch?: Reducer<any, A>
) {
  /**
   *
   * Update the state of an observable based on the provided value or action.
   * @param value - Value or action to update the state with.
   * @returns void
   *
   * @summary If a dispatch function is provided, it is used to process the state update based on the previous state and the value or action.
   * @summary If the dispatch function is not provided and the value is a function, it is called with the previous state and the return value is used as the new state.
   * @summary If neither a dispatch function is provided nor the value is a function, the value itself is used as the new state.
   *
   * @description The updated state is emitted through the observable.next() method.
   */
  const setter = (value: SetStateAction<S> | A) => {
    dispatch
      ? observable.next(dispatch(prevState, value as A))
      : isFunction(value)
      ? observable.next(value(prevState))
      : observable.next(value as S);
  };
  return setter;
}

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
  
  const context = getPortalEntries<string, BehaviorSubject<S>>();
  const observable = context.get(key) ?? new BehaviorSubject(initialState as S);
  if (!context.has(key)) context.set(key, observable);

  const frame = getPortalReducers<S, A>();
  const dispatch = frame.get(observable) ?? reducer;
  if (reducer && !frame.has(observable)) frame.set(observable, reducer);

  const [state, setState] = useState(initialState as S);
  const subRef = useRef<Subscription>();

  useEffect(() => {
    subRef.current = observable.subscribe(setState);
    return () => subRef.current?.unsubscribe();
  }, []);

  const setter = updateState<S, A>(observable, state, dispatch);
  return [state, setter];
}
