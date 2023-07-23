import type { Dispatch, Reducer, SetStateAction } from "react";

import { portal } from "subject";
import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
  usePortalWithAtomStorage,
  usePortalWithCookieStorage,
} from "addons";

import type { Initial, PortalEntries, PortalResult } from "definition";

/**
 * Custom hook to access portal entries and perform deletes.
 *
 * @returns {Object} The portal entries and operators.
 */
export function usePortal(): PortalEntries;

/**
 * Custom hook to access and manage state in the portal system.
 * @template S The type of the state.
 *
 * @param {any} key Unique key identifier for the portal.
 * @param {S} [initialState] The initial state value.
 *
 * @returns {[S, Dispatch<SetStateAction<S>>]} A tuple containing the state and a function for updating the state.
 */
export function usePortal<S>(
  key: any,
  initialState?: Initial<S>
): [S, Dispatch<SetStateAction<S>>];

/**
 * Custom hook to access and manage state in the portal system.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key Unique key identifier for the portal.
 * @param {S} initialState The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalResult<S, A>} A tuple containing the state and a function for updating the state.
 */
export function usePortal<S, A>(
  key: any,
  initialState: Initial<S>,
  reducer?: Reducer<S, A>
): PortalResult<S, A>;

/**
 * @template S The type of the state.
 * @template A The type of the actions.
 */
export function usePortal<S, A = undefined>(
  key?: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalResult<S, A> {
  if (!key) {
    return {
      entries: portal.entries,
      remove: portal.removeItemFromEntries,
      clear: portal.clearEntries,
    };
  }
  return usePortalImplementation({ key, initialState, reducer });
}

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
usePortal.atom = usePortalWithAtomStorage;

/**
 * Custom hook to access and manage state in the portal system with localStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and localStorage.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
usePortal.local = usePortalWithLocalStorage;

/**
 * Custom hook to access and manage state in the portal system with sessionStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and sessionStorage.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
usePortal.session = usePortalWithSessionStorage;

/**
 * Custom hook to access and manage state in the `Cookie` store through the portal system.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system.
 * @param {S} [initialState] The initial state value with the cookie options to be set.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
usePortal.cookie = usePortalWithCookieStorage;
