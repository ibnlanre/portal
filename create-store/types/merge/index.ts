import type { GenericObject } from "@/create-store/types/generic-object";
import type { Prettify } from "@/create-store/types/prettify";

export type Merge<Target, Source> = Source extends GenericObject
  ? Prettify<[Source, Target]>
  : Source;
