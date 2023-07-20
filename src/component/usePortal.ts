import type { Dispatch, Reducer, SetStateAction } from "react";

import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
  usePortalWithCookieOptions,
  usePortalWithAtomStorage,
} from "addons";
import { usePortalEntries } from "entries";
import { getCookieValue } from "cookies";

import type { Initial, PortalEntries, PortalResult } from "entries";

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
 * @param {any} key Unique key identifier for the portal.
 * @param {S} initialState The initial state value.
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
      entries,
      remove: removeItemFromEntries,
      clear: clearEntries,
    };
  }
  return usePortalImplementation(key, initialState, reducer);
}

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
 * @throws {Error} If used outside of a PortalProvider component.
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
 * @throws {Error} If used outside of a PortalProvider component.
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
 * @throws {Error} If used outside of a PortalProvider component.
 */
usePortal.session = usePortalWithSessionStorage;

/**
 * Custom hook to access and manage document.cookie state within the portal system.
 *
 * @param {CookieOptions} [cookieOptions] The cookie options to format.
 * @returns {{ 
 *  cache: PortalImplementation,
 *  options: (cookieOptions: CookieOptions) => CookieOptions,
 *  set: (key: any, value: string) => void 
 * }} Hook to manage state.
 */
usePortal.cookie = usePortalWithCookieOptions;

/**
 * Retrieves the value of the cookie with the specified name from the document.cookie.
 *
 * @param {string} name The name of the cookie.
 * @returns {string|null} The value of the cookie, or null if the cookie is not found.
 */
usePortal.getCookie = getCookieValue;
