import type { Dispatch, Reducer, SetStateAction } from "react";

import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
  usePortalWithCookieOptions,
} from "../addons";
import type { Initial, PortalEntries, PortalResult } from "../entries";
import { usePortalEntries } from "../entries";
import { convertMapToObject } from "../utilities";


export function usePortal(): PortalEntries;

/**
 * Custom hook for creating a portal with basic state management.
 * @template S The type of the state.
 *
 * @param {any} key - Unique key identifier for the portal.
 * @param {S?} initialState - Optional initial state of the portal.
 *
 * @returns {[S, Dispatch<SetStateAction<S>>]} A tuple containing the state and dispatch function for updating the state.
 */
export function usePortal<S>(
  key?: any,
  initialState?: Initial<S>
): [S, Dispatch<SetStateAction<S>>];

/**
 * Custom hook for creating a portal with an optional reducer to update the state.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key - Unique key identifier for the portal.
 * @param {S} initialState - Initial state of the portal, which could be a reducer state.
 * @param {Reducer<S, A>?} reducer - Optional reducer function to handle state updates.
 *
 * @returns {PortalResult<S, A>} A tuple containing the current state and a function to update the state.
 */

export function usePortal<S, A>(
  key: any,
  initialState: Initial<S>,
  reducer?: Reducer<S, A>
): PortalResult<S, A>;

/**
 * Custom hook to access and manage state in the portal system.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system.
 * @param {S?} initialState The initial state value.
 * @param {Reducer<S, A>?} reducer The reducer function to handle state updates.
 *
 * @returns {PortalResult<S, A>} A tuple containing the current state and a function to update the state.
 * @throws {Error} If used outside of a PortalProvider component.
 */

export function usePortal<S, A = undefined>(
  key?: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalResult<S, A> {
  const { entries, removeItemFromEntries, clearEntries } = usePortalEntries();
  if (!key) {
    return {
      entries: convertMapToObject(entries),
      /**
       * Function for deleting a key from the portal system.
       * @param {any} key - The key to delete.
       * @returns {void}
       */
      remove: removeItemFromEntries,
      /**
       * Function for clearing all entries from the portal system.
       * @returns {void}
       */
      clear: clearEntries,
    };
  }
  return usePortalImplementation(key, initialState, reducer);
}

usePortal.local = usePortalWithLocalStorage;
usePortal.session = usePortalWithSessionStorage;
usePortal.cookie = usePortalWithCookieOptions;
