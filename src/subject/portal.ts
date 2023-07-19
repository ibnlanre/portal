import { objectToStringKey } from "utilities";
import { BehaviorSubject } from "./behaviorSubject";
import type { PortalMap } from "entries";

/**
 * Represents a BehaviorSubject containing the portal map.
 * The portal map is a mapping of keys (stringified) to portal entries.
 * @type {BehaviorSubject<PortalMap<any, any>>}
 */
export const portal = new BehaviorSubject<PortalMap<any, any>>(new Map());

/**
 * Check if portal has the specified key.
 *
 * @param {any} v Key to be checked.
 * @returns {boolean} `true` if the value is a function, `false` otherwise.
 */
const hasKey = (v: any): v is true => portal.value.has(v);

/**
 * Sets the value of a portal entry in the portal map.
 *
 * @description
 * If the entry already exists, its value will be replaced with the new value.
 * If the entry does not exist, a `warning` would be displayed in the `console`.
 * @param {any} key The key of the portal entry.
 * @param {any} value The value to be set for the portal entry.
 * @returns {void}
 */
export function setPortalValue(key: any, value: any) {
  const stringKey = objectToStringKey(key);
  if (hasKey(stringKey)) {
    const originalValue = portal.value.get(stringKey);
    originalValue?.observable.next(value);
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("The key:", key, "does not exist in portal entries");
    }

    const copiedMap = new Map(portal.value);
    copiedMap.set(stringKey, {
      observable: new BehaviorSubject(value),
      reducer: undefined,
    });
    portal.next(copiedMap);
  }
}
