import type { GenericObject } from "@/create-store/types/generic-object";

/**
 * Extracts only the function-typed properties from an object.
 *
 * Used to widen a store's state type with the methods/helpers that live on the
 * initial state but are not described by the schema — the schema describes
 * data, functions describe behavior.
 *
 * @example
 * ```ts
 * type State = OnlyFunctions<{ count: number; increment: () => void }>;
 * // { increment: () => void }
 * ```
 */
export type OnlyFunctions<Value extends GenericObject> = {
  [Key in keyof Value as Value[Key] extends (...args: any[]) => any
    ? Key
    : never]: Value[Key];
};
