import { useState, useEffect, type Reducer } from "react";

import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";
import { getCookieValue } from "cookies";

import type { Initial, PortalState, CookieOptions } from "definition";

import { usePortalImplementation } from "./withImplementation";

/**
 * Custom hook to access and manage state in the portal system with the `Cookie` store.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 * @param {CookieOptions} [cookieOptions] The cookie options to be set.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 * @throws {TypeError} If the cookie value does not resolve to a string.
 */
export function usePortalWithCookieStorage<S extends string, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>,
  cookieOptions?: CookieOptions
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

  const [state, setState] = usePortalImplementation<S, A>({
    key: stringKey,
    initialState: cookieState,
    override: overrideApplicationState,
    reducer,
  });

  useEffect(() => {
    cookieStorage.setItem(stringKey, state, cookieOptions);
  }, [state]);

  return [state, setState];
}
