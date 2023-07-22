import type { Reducer } from "react";

import { setEntryValue } from "subject";
import { objectToStringKey } from "utilities";
import { cookieStorage } from "component";

import { usePortalWithCookieStorage } from "./withCookieStorage";

import type { CookieOptions } from "cookies";
import type { PortalImplementation, Initial } from "definition";

export function usePortalWithCookieOptions(cookieOptions?: CookieOptions): {
  /**
   * Custom hook to access and manage state in the portal system with the `Cookie` store.
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key The key to identify the state in the portal system.
   * @param {S} [initialState] The initial state value.
   * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
   *
   * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
   * @throws {Error} If used outside of a PortalProvider component.
   * @throws {TypeError} If the cookie value does not resolve to a string.
   */
  cache: PortalImplementation;
  /**
   * Updates the cookie options.
   *
   * @param {CookieOptions} cookieOptions The new cookie options to be set.
   * @returns {void}
   */
  options: (cookieOptions: CookieOptions) => CookieOptions;
  /**
   * Set a cookie with the specified key and value.
   *
   * @param {any} key The key of the cookie.
   * @param {string} value The value of the cookie.
   * @returns {void}
   */
  set: (key: any, value: string) => void;
} {
  let currentOptions = cookieOptions;

  return {
    cache<S, A = undefined>(
      key: any,
      initialState?: Initial<S>,
      reducer?: Reducer<S, A>
    ) {
      return usePortalWithCookieStorage(
        key,
        initialState,
        reducer,
        currentOptions
      );
    },
    options(cookieOptions) {
      return (currentOptions = {
        ...currentOptions,
        ...cookieOptions,
      });
    },
    set(key: any, value: string) {
      try {
        const stringKey = objectToStringKey(key);
        cookieStorage.setItem(stringKey, value);

        // update the value in the portal system
        setEntryValue(key, value);
      } catch (error) {
        console.error(error);
      }
    },
  };
}
