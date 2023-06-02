import { ReactNode, useState } from "react";
import {
  portalEntries,
  type PortalEntriesContext,
  type PortalEntriesType,
} from "./index";

/**
 * Provider component for the portal entries.
 * @param children - The child components.
 * @returns The PortalEntriesProvider component.
 */
export function PortalEntriesProvider<K, V>({
  children,
}: {
  children: ReactNode;
}) {
  const [value, setValue] = useState<PortalEntriesType<K, V>>(new Map());

  /**
   * Updates the portal entries by adding a new key-value pair.
   * @param key - The key.
   * @param value - The value.
   */
  function updateMap(key: K, value: V): void {
    setValue((originalMap) => {
      const copiedMap = new Map(originalMap);
      copiedMap.set(key, value);
      return copiedMap;
    });
  }

  const EntriesProvider = portalEntries.Provider;
  return (
    <EntriesProvider
      value={
        [value, updateMap] as unknown as PortalEntriesContext<string, unknown>
      }
    >
      {children}
    </EntriesProvider>
  );
}
