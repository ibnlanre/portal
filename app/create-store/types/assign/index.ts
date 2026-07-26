import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";
import type { UnionToTuple } from "@/create-store/types/union-to-tuple";

export type Assign<
  Target extends GenericObject,
  Sources extends GenericObject[],
> =
  UnionToTuple<Sources[number]> extends infer SourceTuple
    ? SourceTuple extends readonly GenericObject[]
      ? AssignHelper<Target, SourceTuple>
      : never
    : never;

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
