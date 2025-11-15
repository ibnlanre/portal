import type { atomic } from "@/create-store/constants/atomic";

/**
 * A unique marker type to identify atomic stores.
 * This type is used internally to exempt objects from
 * being converted into composite stores.
 */
export type Atom = { [atomic]: true };
