import { useState, useEffect } from "react";

import { usePortalImplementation } from "./withImplementation";
import type { PortalState } from "@/definition";

export function usePortalWithSessionStorage<Path extends string, State>(
  path: Path,
  initialState: State
): PortalState<State> {
  let overrideApplicationState = false;

  const [storedState] = useState(() => {
    try {
      if (typeof sessionStorage !== "undefined") {
        const storedValue = sessionStorage.getItem(path);
        if (storedValue) {
          overrideApplicationState = true;
          return JSON.parse(storedValue);
        }
        return initialState;
      }
    } catch (error) {
      console.error("Error retrieving state from sessionStorage:", error);
      return initialState;
    }
  });

  const [state, setState] = usePortalImplementation<Path, State>(
    path,
    storedState,
    overrideApplicationState
  );

  useEffect(() => {
    if (typeof state !== "undefined") {
      try {
        sessionStorage.setItem(path, JSON.stringify(state));
      } catch (error) {
        console.error("Error storing state in sessionStorage:", error);
      }
    }
  }, [path, state]);

  return [state, setState];
}
