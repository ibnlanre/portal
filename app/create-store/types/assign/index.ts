import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";
import type { UnionToTuple } from "@/create-store/types/union-to-tuple";

/**
 * Applies each source to the target in order, so later sources win.
 *
 * When `Sources` is an array of unions, its members are ordered with
 * `UnionToTuple` first. A tuple already carries an order, and converting it to a
 * union and back would discard it, which changes the outcome for conflicting
 * keys.
 */
export type Assign<
  Target extends GenericObject,
  Sources extends GenericObject[],
> = number extends Sources["length"]
  ? UnionToTuple<Sources[number]> extends infer SourceTuple
    ? SourceTuple extends readonly GenericObject[]
      ? AssignHelper<Target, SourceTuple>
      : never
    : never
  : AssignHelper<Target, Sources>;

export type AssignHelper<
  Target extends GenericObject,
  Sources extends readonly GenericObject[],
> = Sources extends [infer Head, ...infer Rest]
  ? Head extends GenericObject
    ? Rest extends readonly GenericObject[]
      ? AssignHelper<Replace<Target, Head>, Rest>
      : Replace<Target, Head>
    : Target
  : Target;
