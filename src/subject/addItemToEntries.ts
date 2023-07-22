import type { PortalEntry } from "definition";
import { portal } from "./portal";

/**
 * Updates the portal entries by adding a new key-value pair.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key.
 * @param {PortalEntry<S, A>} entry The value.
 *
 * @returns {void}
 */
export function addItemToEntries<S, A>(
  key: string,
  entry: PortalEntry<S, A>
): void {
  portal.set(key, entry);
}
