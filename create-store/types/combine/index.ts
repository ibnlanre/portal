import type { Dictionary } from "@/create-store/types/dictionary";
import type { Replace } from "@/create-store/types/replace";
import type { UnionToTuple } from "@/create-store/types/union-to-tuple";

export type Combine<Target extends Dictionary, Sources extends Dictionary[]> =
  UnionToTuple<Sources[number]> extends infer SourceTuple
    ? SourceTuple extends readonly Dictionary[]
      ? CombineHelper<Target, SourceTuple>
      : never
    : never;

export type CombineHelper<
  Target extends Dictionary,
  Sources extends readonly Dictionary[],
> = Sources extends [infer Head, ...infer Rest]
  ? Head extends Dictionary
    ? Rest extends readonly Dictionary[]
      ? CombineHelper<Replace<Target, Head>, Rest>
      : Replace<Target, Head>
    : Target
  : Target;
