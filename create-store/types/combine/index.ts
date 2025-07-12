import type { DeepMerge } from "@/create-store/types/deep-merge";
import type { Dictionary } from "@/create-store/types/dictionary";

export type Combine<
  Target extends Dictionary,
  Sources extends readonly Dictionary[],
> = CombineHelper<[Target, ...Sources]>;

type CombineHelper<
  Source extends Dictionary[],
  Result extends Dictionary = {},
> = Source extends [
  infer Head extends Dictionary,
  ...infer Rest extends Dictionary[],
]
  ? CombineHelper<Rest, DeepMerge<Result, Head>>
  : Source extends Dictionary
    ? DeepMerge<Result, Source>
    : Result;
