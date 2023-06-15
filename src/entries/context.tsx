import { useContext, createContext, type Context } from "react";
import { PortalContext } from ".";

/**
 * Context for the portal entries.
 */
export const portalEntries = createContext<PortalContext<unknown, unknown>>(
  {} as unknown as PortalContext<unknown, unknown>
);

/**
 * Custom hook for accessing the portal entries context.
 * @returns The portal entries context.
 * @throws Error if used outside the PortalEntriesProvider.
 */
export function usePortalEntries<S, A>(): PortalContext<S, A> {
  const context = useContext<PortalContext<S, A>>(
    portalEntries as unknown as Context<PortalContext<S, A>>
  );
  return context;
}
