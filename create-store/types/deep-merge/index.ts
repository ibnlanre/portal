import type { Dictionary } from "@/create-store/types/dictionary";

export type DeepMerge<Target extends Dictionary, Source extends Dictionary> = {
  [Key in Exclude<keyof Source, keyof Target>]: Source[Key];
} & {
  [Key in Exclude<keyof Target, keyof Source>]: Target[Key];
} & {
  [Key in keyof Source & keyof Target]: Target[Key] extends Dictionary
    ? Source[Key] extends Dictionary
      ? DeepMerge<Target[Key], Source[Key]>
      : Source[Key]
    : Source[Key];
};
