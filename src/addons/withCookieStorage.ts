import { useState, useEffect, type Reducer } from "react";

import { usePortalImplementation } from "./withImplementation";
import {
  formatCookieOptions,
  getCookieValue,
  objectToStringKey,
} from "utilities";

import type { Initial, PortalImplementation, PortalState } from "entries";
import type { CookieOptions } from "utilities";
import { setPortalValue } from "subject";

function usePortalWithCookieStorage<S, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>,
  currentOptions?: CookieOptions
): PortalState<S, A> {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [cookieState] = useState(() => {
    const cookieValue = getCookieValue(stringKey);
    if (cookieValue !== null) {
      overrideApplicationState = true;
      return cookieValue as S;
    }
    return initialState;
  });

  const [state, setState] = usePortalImplementation<S, A>(
    stringKey,
    cookieState,
    reducer,
    overrideApplicationState
  );

  useEffect(() => {
    try {
      if (typeof state !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.warn("Cookie value should resolve to a string:", state);
        }
        return;
      }

      if (typeof document !== "undefined") {
        const cookieOptionsString = formatCookieOptions(currentOptions);
        document.cookie = `${stringKey}=${state}${cookieOptionsString}`;
      }
    } catch (error) {
      console.error(error);
    }
  }, [state]);

  return [state, setState];
}

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
        if (typeof value !== "string") {
          if (process.env.NODE_ENV === "development") {
            console.warn("Cookie value should be a string:", value);
          }
          return;
        }

        if (typeof document !== "undefined") {
          const stringKey = objectToStringKey(key);
          const cookieOptionsString = formatCookieOptions(currentOptions);
          document.cookie = `${stringKey}=${value}${cookieOptionsString}`;
          setPortalValue(key, value);
        }
      } catch (error) {
        console.error(error);
      }
    },
  };
}
