import { nodeOf } from "@/create-store/functions/helpers/nodes";

/**
 * Checks for a store made by `primitive`, `composite` or `collection`.
 *
 * @param value Anything.
 * @returns `true` if the value is a store.
 */
export function isStore(value: unknown): boolean {
  return nodeOf(value) !== undefined;
}
