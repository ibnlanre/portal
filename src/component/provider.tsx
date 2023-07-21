import { type Provider } from "react";

import { portalEntries } from "entries";
import {
  portal,
  clearEntries,
  removeItemFromEntries,
  addItemToEntries,
} from "portal";

import type { PortalEntriesContext, PortalEntriesProvider } from "entries";

/**
 * Provider component for the portal system.
 *
 * @param children The child components.
 * @returns The PortalProvider component.
 */
export function PortalProvider({ children }: PortalEntriesProvider) {
  const EntriesProvider = portalEntries.Provider as Provider<
    PortalEntriesContext<any, any>
  >;

  return (
    <EntriesProvider
      value={{
        entries: portal,
        clearEntries,
        removeItemFromEntries,
        addItemToEntries,
      }}
    >
      {children}
    </EntriesProvider>
  );
}
