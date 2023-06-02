import { ReactNode } from "react";

import { PortalReducerProvider } from "../reducers";
import { PortalEntriesProvider } from "../entries";

/**
 * Provider component for the portal entries and reducers.
 * @param children - The child components.
 * @returns The PortalProvider component.
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  return (
    <PortalReducerProvider>
      <PortalEntriesProvider>{children}</PortalEntriesProvider>
    </PortalReducerProvider>
  );
}
