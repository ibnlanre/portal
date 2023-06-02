import { useContext, type Context } from "react";
import { portalReducers, type PortalReducersContext } from "./index";

/**
 * Custom hook for accessing the portal reducers context.
 * @returns The portal reducers context.
 * @throws Error if used outside the PortalReducerProvider.
 */
export function usePortalReducers<S, A>(): PortalReducersContext<S, A> {
  const context = useContext<PortalReducersContext<S, A>>(
    portalReducers as unknown as Context<PortalReducersContext<S, A>>
  );
  if (!context) {
    throw new Error(
      "usePortalReducers must be used within a PortalReducerProvider"
    );
  }
  return context;
}
