import { useState, useEffect } from "react";

import { usePortalImplementation } from "./withImplementation";
import type { PortalState } from "@/definition";

export function usePortalWithLocalStorage<Path extends string, State>(
  path: Path,
  initialState: State
): PortalState<State> {
  let overrideApplicationState = false;

  const [storedState] = useState(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const storedValue = localStorage.getItem(path);
        if (storedValue) {
          overrideApplicationState = true;
          return JSON.parse(storedValue);
        }
        return initialState;
      }
    } catch (error) {
      console.error("Error retrieving state from localStorage:", error);
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
        localStorage.setItem(path, JSON.stringify(state));
      } catch (error) {
        console.error("Error storing state in localStorage:", error);
      }
    }
  }, [path, state]);

  return [state, setState];
}
