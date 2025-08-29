import type { GenericObject } from "@/create-store/types/generic-object";

export type Merge<Target, Source> = Source extends GenericObject
  ? Source & Target
  : Source;
