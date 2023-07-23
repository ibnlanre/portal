import { useState, useEffect, type Reducer } from "react";

import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";
import { getCookieValue } from "cookies";

import type { PortalState, CookieEntry } from "definition";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<
  S extends CookieEntry,
  A = undefined
>(key: any, initialState: S, reducer?: Reducer<S, A>): PortalState<S, A> {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [cookieState] = useState(() => {
    const value = getCookieValue(stringKey);
    if (value !== null) {
      overrideApplicationState = true;
      return { ...initialState, value };
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
    const { value, ...options } = state;
    cookieStorage.setItem(stringKey, state.value, options);
  }, [state]);

  return [state, setState];
}
