import { Context, useContext } from "react";
import { portalEntries, type PortalEntriesContext } from "./index";

/**
 * Custom hook for accessing the portal entries context.
 * @returns The portal entries context.
 * @throws Error if used outside the PortalEntriesProvider.
 */
export function usePortalEntries<K, V>(): PortalEntriesContext<K, V> {
  const context = useContext<PortalEntriesContext<K, V>>(
    portalEntries as unknown as Context<PortalEntriesContext<K, V>>
  );
  if (!context) {
    throw new Error(
      "usePortalEntries must be used within a PortalEntriesProvider"
    );
  }
  return context;
}
