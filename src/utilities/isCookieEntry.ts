import { CookieEntry } from "definition";

/**
 * Type guard function to check if the provided entry is a type of `CookieEntry`.
 *
 * @param {CookieEntry} value The value to be checked.
 * @returns {value is CookieEntry} `true` if the entry has a `value` property, `false` otherwise.
 */
export function isCookieEntry<S>(entry: S | CookieEntry): entry is CookieEntry {
  return entry && typeof entry === "object" && "value" in entry;
}
