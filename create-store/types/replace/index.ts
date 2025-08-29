import type { GenericObject } from "@/create-store/types/generic-object";
import type { Prettify } from "@/create-store/types/prettify";
import type { Reference } from "@/create-store/types/reference";

export type Replace<Target, Source> = [Source] extends [Reference]
  ? Source
  : [Target] extends [GenericObject]
    ? [Source] extends [GenericObject]
      ? ReplaceHelper<Target, Source>
      : Source
    : NonNullable<Source>;

type ReplaceHelper<
  Target extends GenericObject,
  Source extends GenericObject,
> = Prettify<
  [
    Pick<Source, Exclude<keyof Source, keyof Target>>,
    Pick<Target, Exclude<keyof Target, keyof Source>>,
    {
      [Key in keyof Target]: Replace<Target[Key], Source[Key]>;
    },
    {
      [Key in keyof Source]: Replace<Target[Key], Source[Key]>;
    },
  ]
>;
