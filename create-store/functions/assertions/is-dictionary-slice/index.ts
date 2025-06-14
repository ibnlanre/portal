import type { DeepPartial } from "@/create-store/types/deep-partial";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

export function isDictionarySlice<T extends Record<string, unknown>>(
  target: T,
  source: unknown
): source is DeepPartial<T> {
  if (!isDictionary(source)) return false;
  return Object.keys(source).every((key) => key in target);
}
