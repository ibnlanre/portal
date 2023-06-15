import { useState, useEffect, type Reducer } from "react";

import { usePortalImplementation } from "./withImplementation";
import {
  isFunction,
  formatCookieOptions,
  getCookieValue,
  objectToStringKey,
} from "../utilities";

import type { Initial, PortalImplementation, PortalState } from "../entries";
import type { CookieOptions } from "../utilities";

/**
 * Custom hook to access and manage document.cookie state within the portal system.
 * @param {CookieOptions} [cookieOptions] The cookie options to format.
 * @returns {{ cache: PortalImplementation }} Hook to manage state.
 */
export function usePortalWithCookieOptions(cookieOptions?: CookieOptions): {
  cache: PortalImplementation;
} {
  /**
   * Custom hook to access and manage state in the portal system with sessionStorage support.
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key The key to identify the state in the portal system.
   * @param {S} [initialState] The initial state value.
   * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
   *
   * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
   * @throws {Error} If used outside of a PortalProvider component.
   */
  function usePortalWithCookieStorage<S, A = undefined>(
    key: any,
    initialState?: Initial<S>,
    reducer?: Reducer<S, A>
  ): PortalState<S, A> {
    const [cookieState, setCookieState] = useState<S | undefined>(undefined);
    const stringKey = objectToStringKey(key);

    useEffect(() => {
      const cookieValue = getCookieValue(stringKey);
      if (cookieValue !== null) {
        const parsedState = JSON.parse(decodeURIComponent(cookieValue));
        setCookieState(parsedState);
      } else {
        if (initialState instanceof Promise) {
          initialState.then((value) => {
            const encodedState = encodeURIComponent(JSON.stringify(value));
            const cookieOptionsString = formatCookieOptions(cookieOptions);
            document.cookie = `${stringKey}=${encodedState}${cookieOptionsString}`;
          });
        } else {
          const plainState = isFunction(initialState)
            ? initialState()
            : initialState;
          const encodedState = encodeURIComponent(JSON.stringify(plainState));
          const cookieOptionsString = formatCookieOptions(cookieOptions);
          document.cookie = `${stringKey}=${encodedState}${cookieOptionsString}`;
        }
      }
    }, [stringKey, initialState]);

    const [state, setState] = usePortalImplementation<S, A>(
      stringKey,
      cookieState,
      reducer
    );

    useEffect(() => {
      const encodedState = encodeURIComponent(JSON.stringify(state));
      const cookieOptionsString = formatCookieOptions(cookieOptions);
      document.cookie = `${stringKey}=${encodedState}${cookieOptionsString}`;
    }, [stringKey, state]);

    return [state, setState];
  }

  return {
    cache: usePortalWithCookieStorage,
  };
}
