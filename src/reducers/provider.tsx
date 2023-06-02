import { useState, type ReactNode, type Reducer } from "react";
import {
  portalReducers,
  PortalReducersType,
  type PortalReducersContext,
} from "./index";

/**
 * Provider component for the portal reducers.
 * @param children - The child components.
 * @returns The PortalReducerProvider component.
 */
export function PortalReducerProvider<S, A>({
  children,
}: {
  children: ReactNode;
}) {
  const [value, setValue] = useState<PortalReducersType<S, A>>(new Map());

  /**
   * Updates the portal reducers by adding a new key-value pair.
   * @param key - The key.
   * @param reducer - The reducer.
   */
  function updateMap(key: string, reducer: Reducer<S, A>): void {
    setValue((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.set(key, reducer);
      return originalMap;
    });
  }

  const ReducerProvider = portalReducers.Provider;
  return (
    <ReducerProvider
      value={
        [value, updateMap] as unknown as PortalReducersContext<unknown, unknown>
      }
    >
      {children}
    </ReducerProvider>
  );
}
