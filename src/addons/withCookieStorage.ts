import { useState, useEffect, type Reducer } from "react";

import { cookieStorage } from "component";
import { isCookieEntry, objectToStringKey } from "utilities";
import { getCookieValue } from "cookies";

import type { Initial, PortalState, CookieEntry } from "definition";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<
  S extends string | CookieEntry,
  A = undefined
>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [cookieState] = useState(() => {
    const value = getCookieValue(stringKey);
    if (value !== null) {
      overrideApplicationState = true;
      return value as S;
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
    if (typeof state === "string") cookieStorage.setItem(stringKey, state);
    else if (isCookieEntry(state)) {
      const { value, ...options } = { ...state };
      const prevValue = cookieStorage.getItem(stringKey) ?? "";
      cookieStorage.setItem(stringKey, value ?? prevValue, options);
    }
  }, [state]);

  return [state, setState];
}
