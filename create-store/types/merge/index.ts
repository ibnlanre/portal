import type { Dictionary } from "@/create-store/types/dictionary";

export type Merge<Target extends Dictionary, Source> = Source extends Dictionary
  ? Target & Source
  : Source;
