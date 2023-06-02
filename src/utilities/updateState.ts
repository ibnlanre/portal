import { isFunction } from "./isFuntion";
import type { Reducer, SetStateAction } from "react";
import { type BehaviorSubject } from "rxjs";

/**
 *
 * Update the state of an observable using the provided value and dispatch function (optional).
 * @param observable - BehaviorSubject representing the state.
 * @param prevState - Previous state value.
 * @param dispatch - Optional reducer function to handle state updates.
 * @returns A function that takes a value or action and updates the state accordingly.
 */
export function updateState<S, A>(
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
