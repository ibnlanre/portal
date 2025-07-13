import type { DeepMerge } from "@/create-store/types/deep-merge";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Prettify } from "@/create-store/types/prettify";

export type Replace<
  Target extends Dictionary,
  Source extends Dictionary,
> = Prettify<
  {
    [Key in Exclude<keyof Source, keyof Target>]: Source[Key];
  } & {
    [Key in Exclude<keyof Target, keyof Source>]: Target[Key];
  } & {
    [Key in keyof (Source & Target)]: Key extends keyof Source
      ? Key extends keyof Target
        ? DeepMerge<Target[Key], Source[Key]>
        : Source[Key]
      : Key extends keyof Target
        ? Target[Key]
        : never;
  } & {
    [Key in keyof Source & keyof Target]: Target[Key] extends Dictionary
      ? Source[Key] extends Dictionary
        ? Replace<Target[Key], Source[Key]>
        : Source[Key]
      : Source[Key];
  }
>;
