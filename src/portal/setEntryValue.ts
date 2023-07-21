import { portal } from "./map";

import { objectToStringKey } from "utilities";
import { BehaviorSubject } from "subject";

/**
 * Sets the value of a portal entry in the portal map.
 *
 * @description
 * If the entry already exists, its value will be replaced with the new value.
 * If the entry does not exist, a `warning` would be displayed in the `console`.
 *
 * @param {any} key The key of the portal entry.
 * @param {any} value The value to be set for the portal entry.
 * @returns {void}
 */
export function setEntryValue(key: any, value: any) {
  const stringKey = objectToStringKey(key);
  if (portal.value.has(stringKey)) {
    const originalValue = portal.value.get(stringKey);
    originalValue?.observable.next(value);
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("The key:", key, "does not exist in portal entries");
    }

    portal.value.set(stringKey, {
      observable: new BehaviorSubject(value),
      reducer: undefined,
    });
  }
}
