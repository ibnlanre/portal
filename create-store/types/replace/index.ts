import type { Dictionary } from "@/create-store/types/dictionary";
import type { Prettify } from "@/create-store/types/prettify";

export type Replace<Target, Source> = Target extends Dictionary
  ? Source extends Dictionary
    ? ReplaceHelper<Target, Source>
    : Source
  : Source;

type ReplaceHelper<
  Target extends Dictionary,
  Source extends Dictionary,
> = Prettify<
  Pick<Source, Exclude<keyof Source, keyof Target>> &
    Pick<Target, Exclude<keyof Target, keyof Source>> & {
      [Key in keyof Source & keyof Target]: Replace<Target[Key], Source[Key]>;
    }
>;
