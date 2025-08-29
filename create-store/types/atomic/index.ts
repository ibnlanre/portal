import type { Atom } from "@/create-store/types/atom";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Prettify } from "@/create-store/types/prettify";
import type { Replace } from "@/create-store/types/replace";

import { createStore } from "@/create-store";
import { combine } from "@/create-store/functions/helpers/combine";
import { atom } from "@/create-store/functions/library/atom";

/**
 * An atomic store is a store that is treated as a single unit.
 * It is not broken down into its individual properties like
 * composite stores. This is useful for primitive values
 * or when you want to manage the entire object as a whole.
 *
 * Atomic stores are identified by the presence of the `Atom` type.
 * This type acts as a marker to exempt the object from being
 * converted into a composite store.
 *
 * @example
 * ```ts
 * import { atom } from "@ibnlanre/portal";
 *
 * type CountStore = Atomic<{ count: number }>;
 * const countStore = createStore<CountStore>(atom({ count: 0 }));
 *
 * // The entire object is treated as a single unit.
 * const [state, setState] = countStore.$use();
 *
 * setState({ count: 1 }); // ✅ Valid
 * setState(({ count = 0 }) => ({ count: count + 1 })); // ✅ Valid
 *
 * // Individual properties are not directly accessible.
 * const [count, setCount] = countStore.count.$use(); // ❌ Error
 * ```
 */
export type Atomic<State extends GenericObject> = Prettify<[Atom, State]>;
