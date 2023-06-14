import { useState, type Reducer, type ReactNode } from "react";
import {
  portalReducers,
  PortalReducersType,
  type PortalReducersContext,
} from "./index";

interface IPortalReducersProvider {
  children: ReactNode;
}

/**
 * Provider component for the portal reducers.
 * @param children - The child components.
 * @returns The PortalReducerProvider component.
 */
export function PortalReducerProvider<S, A>({
  children,
}: IPortalReducersProvider) {
  const [reducers, setReducers] = useState<PortalReducersType<S, A>>(new Map());

  /**
   * Updates the portal reducers by adding a new key-value pair.
   * @param key - The key.
   * @param reducer - The reducer.
   */
  function addItemToReducers(key: string, reducer: Reducer<S, A>): void {
    setReducers((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.set(key, reducer);
      return originalMap;
    });
  }

  /**
   * Removes an item from the portal reducers based on the specified key.
   * @param key - The key of the item to remove.
   */
  function removeItemFromReducers(key: string): void {
    setReducers((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.delete(key);
      return copiedMap;
    });
  }

  const ReducerProvider = portalReducers.Provider;
  return (
    <ReducerProvider
      value={
        {
          reducers,
          addItemToReducers,
          removeItemFromReducers,
        } as unknown as PortalReducersContext<unknown, unknown>
      }
    >
      {children}
    </ReducerProvider>
  );
}
