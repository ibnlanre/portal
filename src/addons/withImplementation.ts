import { useState, useEffect, Reducer } from "react";

import { usePortalEntries } from "entries";
import { getComputedState, objectToStringKey, updateState } from "utilities";
import { BehaviorSubject } from "subject";

import type { PortalState, PortalEntry, Initial, Atomic } from "entries";

/**
 * Represents the configuration options for the implementation of a custom hook
 * to access and manage state in the portal system with Atom storage support.
 *
 * @template S The type of the state.
 * @template A The type of the actions.
 */
export type Implementation<S, A = undefined> = {
  /**
   * Unique key identifier for the portal.
   */
  key: any;

  /**
   * The initial state value.
   */
  initialState?: Initial<S>;

  /**
   * The reducer function to handle state updates.
   */
  reducer?: Reducer<S, A>;

  /**
   * If true, override an existing portal entry with the same key.
   */
  override?: boolean;

  /**
   * If true, isolate the portal entry from the global portal entries.
   */
  isolate?: boolean;

  /**
   * The Atom instance to use for state storage and management.
   */
  atom?: Atomic<S, A>;
};

/**
 * Custom hook to access and manage state in the portal system with Atom storage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Object} options The options object containing configuration properties for the hook.
 * @param {any} options.key Unique key identifier for the portal.
 * @param {Initial<S>} [options.initialState] The initial state value.
 * @param {Reducer<S, A>} [options.reducer] The reducer function to handle state updates.
 * @param {boolean} [options.override=false] If `true`, override an existing portal entry with the same key.
 * @param {boolean} [options.isolate=false] If `true`, isolate the portal entry from the global portal entries.
 * @param {Atomic<S, A>} [options.atom] The Atom instance to use for state storage and management.
 *
 * @returns {PortalState<S, A>} An object containing the current state and a function to update the state.
 * @throws {TypeError} If the provided initialState is a Promise that doesn't resolve to type `S`.
 * @throws {Error} If the Atom instance is not provided.
 */
export function usePortalImplementation<S, A>({
  key,
  initialState,
  reducer,
  override = false,
  isolate = false,
  atom,
}: Implementation<S, A>): PortalState<S, A> {
  const { entries, addItemToEntries } = usePortalEntries<S, A>();
  const stringKey = objectToStringKey(key);

  if (!entries) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  const [subject] = useState<PortalEntry<S, A>>(() => {
    if (atom) return atom.getItem();

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
  });

  const [state, setState] = useState(subject.observable.value);

  useEffect(() => {
    const subscriber = subject.observable.subscribe(setState);

    if (!isolate && !entries.has(stringKey)) {
      addItemToEntries(stringKey, subject);
    }

    if (typeof initialState !== "undefined") {
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
