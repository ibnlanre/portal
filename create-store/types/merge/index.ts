import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";

export type Merge<
  Target extends GenericObject,
  Source,
> = Source extends GenericObject ? Replace<Target, Source> : Source;
