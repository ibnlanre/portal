import { useState, useEffect } from "react";

import { getValue } from "@/utilities";
import { usePortalImplementation } from "./withImplementation";

import type { Builder, GetValueByPath, Paths, PortalState } from "@/definition";

export function usePortalWithLocalStorage<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>,
  State extends GetValueByPath<Store, Path>
>(builder: Builder<Store, any>, path: Path): PortalState<State> {
  const initialState = getValue(builder.use(), path);
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
      const item = store?.getItem(path);
      if (item) overrideApplicationState = true;
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error retrieving state from localStorage:", error);
      return initialState;
    }
  });

  const [state, setState] = usePortalImplementation<State, Path>(
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
