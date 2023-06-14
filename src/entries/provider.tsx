import { useState, type ComponentProps } from "react";
import {
  portalEntries,
  type PortalEntriesContext,
  type PortalEntriesType,
} from "./index";

interface IPortalEntriesProvider
  extends ComponentProps<
    React.Provider<PortalEntriesContext<string, unknown>>
  > {}

/**
 * Provider component for the portal entries.
 * @param children - The child components.
 * @returns The PortalEntriesProvider component.
 */
export function PortalEntriesProvider<K, V>({
  children,
}: IPortalEntriesProvider) {
  const [entries, setEntries] = useState<PortalEntriesType<K, V>>(new Map());

  /**
   * Updates the portal entries by adding a new key-value pair.
   * @param key - The key.
   * @param value - The value.
   */
  function addItemToEntries(key: K, value: V): void {
    setEntries((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.set(key, value);
      return copiedMap;
    });
  }

  /**
   * Removes an item from the portal entries based on the specified key.
   * @param key - The key of the item to remove.
   */
  function removeItemFromEntries(key: K): void {
    setEntries((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.delete(key);
      return copiedMap;
    });
  }

  const EntriesProvider = portalEntries.Provider;
  return (
    <EntriesProvider
      value={
        {
          entries,
          addItemToEntries,
          removeItemFromEntries,
        } as unknown as PortalEntriesContext<string, unknown>
      }
    >
      {children}
    </EntriesProvider>
  );
}
