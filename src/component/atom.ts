import type { Reducer } from "react";

import { getComputedState } from "utilities";
import { BehaviorSubject } from "subject";

import type { Action, Atom, Initial, PortalEntry } from "definition";

type AtomOptions<S, A> = {
  initialState: Initial<S>;
  reducer?: Reducer<S, A>;
};

/**
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {S} initialState The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {Atom<S, A>} An instance of the Atom class.
 */
export function atom<S, A = undefined>({
  initialState,
  reducer,
}: AtomOptions<S, A>): Atom<S, A> {
  const subject: PortalEntry<S, A> = {
    observable: new BehaviorSubject(undefined as S),
    reducer: undefined,
  };

  const resolveInitialState = (state: S) => {
    subject.observable.next(state);
    subject.reducer = reducer;
  };

  if (initialState instanceof Promise) {
    initialState.then(resolveInitialState);
  } else {
    const computedState = getComputedState(initialState);
    resolveInitialState(computedState);
  }

  const props = {
    /**
     * Retrieves the current value of the observable stored in the subject.
     *
     * @template T The type of the value stored in the observable.
     * @returns {T} The current value of the observable.
     */
    getItem: <T = S>() => {
      return subject.observable.value as unknown as T;
    },

    /**
     * Sets the value of the Atom instance in the portal map.
     * @param {S} value The new value to set.
     */
    setItem: (value: Action<S, A>) => {
      const { observable, reducer } = subject;
      const setter = observable.watch(reducer);
      setter(value);
    },
  };

  /**
   * Retrieves the subject associated with the Atom instance.
   * @returns {Object} An object containing the subject.
   */
  Object.defineProperty(atom, "value", {
    value: subject,
    enumerable: false,
  });

  return props;
}
