import { useState, useEffect } from "react";

import { getValue } from "@/utilities";
import { usePortalImplementation } from "./withImplementation";

import type { Builder, GetValueByPath, Paths, PortalState } from "@/definition";

export function usePortalWithSessionStorage<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>,
  State extends GetValueByPath<Store, Path>
>(builder: Builder<Store, any>, path: Path): PortalState<State> {
  const initialState = getValue(builder.use(), path);
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
      const item = store?.getItem(path);
      if (item) overrideApplicationState = true;
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error retrieving state from sessionStorage:", error);
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
        sessionStorage.setItem(path, JSON.stringify(state));
      } catch (error) {
        console.error("Error storing state in sessionStorage:", error);
      }
    }
  }, [path, state]);

  return [state, setState];
}
