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

/**
 * Custom hook to access portal entries and perform deletes.
 *
 * @returns {Object} The portal entries and operators.
 * @throws {Error} If used outside of a PortalProvider component.
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
 * @throws {Error} If used outside of a PortalProvider component.
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
 * @param {any} [key] Unique key identifier for the portal.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalResult<S, A>} A tuple containing the state and a function for updating the state.
 * @throws {Error} If used outside of a PortalProvider component.
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
  const { entries, removeItemFromEntries, clearEntries } = usePortalEntries();
  if (!key) {
    return {
      /**
       * Object containing a record of each portal value and reducer function
       * @type {Object}
       */
      entries: convertMapToObject(entries),
      /**
       * Function for deleting a key from the portal system.
       * @param {any} key The key to delete.
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
