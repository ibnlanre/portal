import { useState, useEffect, type Reducer } from "react";

import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";
import { getCookieValue } from "cookies";

import type { Initial, PortalState } from "definition";
import type { CookieOptions } from "cookies";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<S, A = undefined>(
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

  const [state, setState] = usePortalImplementation<S, A>({
    key: stringKey,
    initialState: cookieState,
    override: overrideApplicationState,
    reducer,
  });

  useEffect(() => {
    try {
      if (typeof state !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.warn("Cookie value should resolve to a string:", state);
        }
        return;
      }
      cookieStorage.setItem(stringKey, state, currentOptions);
    } catch (error) {
      console.error(error);
    }
  }, [state]);

  return [state, setState];
}
