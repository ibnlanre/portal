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
 * Context type for the portal reducers.
 */
export type PortalReducersContext<S, A> = [
  PortalReducersType<S, A>,
  PortalReducersSetter<S, A>
];

/**
 * Context for the portal reducers.
 */
export const portalReducers = createContext<
  PortalReducersContext<unknown, unknown> | unknown[]
>([]);

export * from "./hook";
export * from "./provider";