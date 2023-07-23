import { useState, useEffect, type Reducer } from "react";

import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";
import { getCookieValue } from "cookies";

import type { CookieEntry, Dispatcher } from "definition";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<S = CookieEntry, A = undefined>(
  key: any,
  initialState?: S,
  reducer?: Reducer<S, A>
): [string | undefined, Dispatcher<S, A>] {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [cookieState] = useState(() => {
    const value = getCookieValue(stringKey);
    if (value !== null) {
      overrideApplicationState = true;
      return { ...initialState, value } as S;
    }
    return initialState as S;
  });

  const [state, setState] = usePortalImplementation<S, A>({
    key: stringKey,
    initialState: cookieState,
    override: overrideApplicationState,
    reducer,
  });

  const { value, ...options } = { ...state } as CookieEntry;
  useEffect(() => {
    if (value) cookieStorage.setItem(stringKey, value, options);
  }, [value]);

  return [value, setState];
}
