import type { Dictionary } from "@/create-store/types/dictionary";
import type { Replace } from "@/create-store/types/replace";

/**
 * Deeply merge two items.
 * If both are dictionaries, merge deeply.
 * Otherwise, `Source` overrides `Target`.
 */
export type DeepMerge<Target, Source> = Target extends Dictionary
  ? Source extends Dictionary
    ? Replace<Target, Source>
    : Source
  : Source;
