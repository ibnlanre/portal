import { createContext, type Reducer } from "react";

/**
 * Represents a map of keys and reducers in the portal reducers.
 */
export type PortalReducersType<S, A> = Map<string, Reducer<S, A>>;

/**
 * Function type for setting a key-value pair in the portal reducers.
 */
export type PortalReducersSetter<S, A> = (
  key: string,
  value: Reducer<S, A>
) => void;

/**
 * Function type for removing an item in the portal entries.
 */
export type PortalEntriesRemover = (key: string) => void;

/**
 * Context type for the portal reducers.
 */
export type PortalReducersContext<S, A> = {
  reducers: PortalReducersType<S, A>;
  addItemToReducers: PortalReducersSetter<S, A>;
  removeItemFromReducers: PortalEntriesRemover;
};

/**
 * Context for the portal reducers.
 */
export const portalReducers = createContext<
  PortalReducersContext<unknown, unknown> | unknown[]
>([]);

export * from "./hook";
export * from "./provider";
