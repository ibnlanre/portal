import { useState, useEffect, type Reducer } from "react";

import { objectToStringKey } from "utilities";
import { usePortalImplementation } from "./withImplementation";

import type { Initial, PortalState } from "definition";

export function usePortalWithLocalStorage<S, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [store] = useState(() => {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (error) {
      console.error("Cannot find localStorage", error);
    }
    return undefined;
  });

  const [storedState] = useState(() => {
    try {
      const item = store?.getItem(stringKey);
      if (item) overrideApplicationState = true;
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error retrieving state from localStorage:", error);
      return initialState;
    }
  });

  const [state, setState] = usePortalImplementation<S, A>({
    key: stringKey,
    initialState: storedState,
    override: overrideApplicationState,
    reducer,
  });

  useEffect(() => {
    if (typeof state !== "undefined") {
      try {
        localStorage.setItem(stringKey, JSON.stringify(state));
      } catch (error) {
        console.error("Error storing state in localStorage:", error);
      }
    }
  }, [stringKey, state]);

  return [state, setState];
}
