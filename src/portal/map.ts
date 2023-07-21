import type { PortalMap } from "entries";
import { BehaviorSubject } from "subject";

/**
 * Represents a mapping of keys (stringified) to portal entries.
 * @type {BehaviorSubject<PortalMap<any, any>>}
 */
export const portal: BehaviorSubject<PortalMap<any, any>> = new BehaviorSubject(
  new Map()
);
