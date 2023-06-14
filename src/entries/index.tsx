import { createContext } from "react";

/**
 * Represents a map of keys and values in the portal entries.
 */
export type PortalEntriesType<K, V> = Map<K, V>;

/**
 * Function type for setting a key-value pair in the portal entries.
 */
export type PortalEntriesSetter<K, V> = (key: K, value: V) => void;

/**
 * Function type for removing an item in the portal entries.
 */
export type PortalEntriesRemover<K> = (key: K) => void;

/**
 * Context type for the portal entries.
 */
export type PortalEntriesContext<K, V> = {
  entries: PortalEntriesType<K, V>;
  addItemToEntries: PortalEntriesSetter<K, V>;
  removeItemFromEntries: PortalEntriesRemover<K>;
};

/**
 * Context for the portal entries.
 */
export const portalEntries = createContext<
  PortalEntriesContext<string, unknown> | unknown[]
>([]);

export * from "./hook";
export * from "./provider";
