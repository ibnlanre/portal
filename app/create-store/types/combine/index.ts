import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";

export type Combine<Objects extends GenericObject[]> = Objects extends [
  infer First extends GenericObject,
  ...infer Rest extends GenericObject[],
]
  ? CombineHelper<First, Rest>
  : number extends Objects["length"]
    ? Objects[number]
    : {};

export type CombineHelper<
  Target extends GenericObject,
  Objects extends readonly GenericObject[],
> = Objects extends [infer Head, ...infer Rest]
  ? Head extends GenericObject
    ? Rest extends readonly GenericObject[]
      ? CombineHelper<Replace<Target, Head>, Rest>
      : Replace<Target, Head>
    : Target
  : Target;
