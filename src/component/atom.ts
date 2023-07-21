import type { Reducer } from "react";

import { getComputedState, objectToStringKey, updateState } from "utilities";
import { BehaviorSubject } from "subject";

import type { Action, Atomic, Initial, PortalEntry } from "entries";

export class Atom<S, A = undefined> implements Atomic<S, A> {
  private key: string;
  private subject: PortalEntry<S, A> = {
    observable: new BehaviorSubject(undefined as S),
    reducer: undefined,
  };

  /**
   * @template S The type of the state.
   *
   * @param {any} key Unique key identifier for the portal.
   * @param {S} [initialState] The initial state value.
   *
   * @returns {Atom<S, A>} An instance of the Atom class.
   */
  constructor(key: any, initialState?: Initial<S>);

  /**
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key Unique key identifier for the portal.
   * @param {S} initialState The initial state value.
   * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
   *
   * @returns {Atom<S, A>} An instance of the Atom class.
   */
  constructor(key: any, initialState: Initial<S>, reducer?: Reducer<S, A>) {
    this.key = objectToStringKey(key);

    // bind to protect against undefined `this`.
    this.destructure = this.destructure.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);

    const resolveInitialState = (state: S) => {
      this.subject.observable.next(state);
      this.subject.reducer = reducer;
    };

    if (initialState instanceof Promise) {
      initialState.then(resolveInitialState);
    } else {
      const computedState = getComputedState(initialState);
      resolveInitialState(computedState);
    }
  }

  /**
   * Retrieves the key, stored state, and reducer associated with the Atom instance.
   * @returns {Object} An object containing the key, stored state, and reducer.
   */
  destructure() {
    const entry = this.subject;
    return {
      subject: entry,
      storedState: entry.observable.value,
      reducer: entry.reducer,
      key: this.key,
    };
  }

  /**
   * Retrieves the current value of the observable stored in the subject.
   *
   * @template T The type of the value stored in the observable.
   * @returns {T} The current value of the observable.
   */
  getItem<T = S>() {
    return this.subject.observable.value as unknown as T;
  }

  /**
   * Sets the value of the Atom instance in the portal map.
   * @param {S} value The new value to set.
   */
  setItem(value: Action<S, A>) {
    const entry = this.subject;
    const setter = updateState<S, A>(
      entry.observable,
      entry.observable.value,
      entry.reducer
    );
    setter(value);
  }
}
