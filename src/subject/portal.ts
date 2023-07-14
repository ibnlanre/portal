import { objectToStringKey } from "utilities";
import { BehaviorSubject } from "./behaviorSubject";
import type { PortalEntry, PortalMap } from "entries";

/**
 * Represents a BehaviorSubject containing the portal map.
 * The portal map is a mapping of keys (stringified) to portal entries.
 * @type {BehaviorSubject<PortalMap<any, any>>}
 */
export const portal = new BehaviorSubject<PortalMap<any, any>>(new Map());

/**
 * Sets the value of a portal entry in the portal map.
 * If the entry already exists, its value will be replaced with the new value.
 * If the entry does not exist, a new entry will be created.
 * @param {any} key The key of the portal entry.
 * @param {any} value The value to be set for the portal entry.
 * @returns {Map<string, PortalEntry<any, any>>} The updated portal map.
 */
export function setPortalValue(key: any, value: any) {
  const stringKey = objectToStringKey(key);
  const originalValue = portal.value.get(stringKey);
  const copiedMap = new Map(portal.value);
  copiedMap.set(stringKey, {
    ...(originalValue as PortalEntry<any, any>),
    observable: new BehaviorSubject(value),
  });
  return copiedMap;
}