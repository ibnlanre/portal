import type { Reducer } from "react";

import { getComputedState, objectToStringKey } from "utilities";
import { BehaviorSubject } from "subject";
import type { Initial, PortalEntry } from "entries";

export class Atom<S, A = undefined> {
  private portal = new Map<string, PortalEntry<S, A>>();
  private state: S | undefined;
  private key: string;
  private reducer?: Reducer<S, A>;

  /**
   * Custom hook to access and manage state in the portal system.
   * @template S The type of the state.
   *
   * @param {any} key Unique key identifier for the portal.
   * @param {S} [initialState] The initial state value.
   *
   * @returns {Atom<S, A>} An instance of the Atom class.
   */
  constructor(key: any, initialState?: Initial<S>);

  /**
   * Custom hook to access and manage state in the portal system.
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
    this.state = undefined;
    this.reducer = reducer;

    // bind to protect against undefined `this`.
    this.destructure = this.destructure.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);

    const resolveInitialState = (state: S) => {
      this.state = state;
      this.reducer = reducer;

      const entry: PortalEntry<S, A> = {
        observable: new BehaviorSubject(this.state),
        reducer,
      };
      this.portal.set(this.key, entry);
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
    return {
      key: this.key,
      storedState: this.state,
      reducer: this.reducer,
    };
  }

  /**
   * Retrieves the entry associated with the Atom instance from the portal map.
   * @returns {PortalEntry<S, A> | undefined} The entry associated with the Atom instance.
   */
  getItem() {
    return this.portal.get(this.key);
  }

  /**
   * Sets the value of the Atom instance in the portal map.
   * @param {S} value The new value to set.
   */
  setItem(value: S) {
    const entry = this.portal.get(this.key);
    if (entry) {
      entry.observable.next(value);
      this.state = value;
    }
  }
}
