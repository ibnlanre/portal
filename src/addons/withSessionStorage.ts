import { useState, useEffect, type Reducer } from "react";

import { objectToStringKey } from "utilities";
import { usePortalImplementation } from "./withImplementation";

import type { Initial, PortalState } from "definition";

export function usePortalWithSessionStorage<S, A>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const stringKey = objectToStringKey(key);
  let overrideApplicationState = false;

  const [store] = useState(() => {
    try {
      if (typeof sessionStorage !== "undefined") return sessionStorage;
    } catch (error) {
      console.error("Cannot find sessionStorage", error);
    }
    return undefined;
  });

  const [storedState] = useState(() => {
    try {
      const item = store?.getItem(stringKey);
      if (item) overrideApplicationState = true;
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error retrieving state from sessionStorage:", error);
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
        sessionStorage.setItem(stringKey, JSON.stringify(state));
      } catch (error) {
        console.error("Error storing state in sessionStorage:", error);
      }
    }
  }, [stringKey, state]);

  return [state, setState];
}
