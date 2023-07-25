import { useContext, createContext, type Context } from "react";
import { PortalEntriesContext } from "definition";

/**
 * Context for the portal entries.
 */
export const portalEntries = createContext<
  PortalEntriesContext<unknown, unknown>
>({} as unknown as PortalEntriesContext<unknown, unknown>);

/**
 * Custom hook for accessing the portal entries context.
 * @returns The portal entries context.
 * @throws Error if used outside the PortalEntriesProvider.
 */
export function usePortalEntries<S, A>(): PortalEntriesContext<S, A> {
  const context = useContext<PortalEntriesContext<S, A>>(
    portalEntries as unknown as Context<PortalEntriesContext<S, A>>
  );
  return context;
}