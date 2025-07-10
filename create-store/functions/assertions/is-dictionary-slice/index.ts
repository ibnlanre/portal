import type { DeepPartial } from "@/create-store/types/deep-partial";

import { isPrimitive } from "@/create-store/functions/assertions/is-primitive";

export function isDictionarySlice<T extends Record<string, unknown>>(
  target: T,
  source: unknown
): source is DeepPartial<T> {
  if (isPrimitive(source)) return false;

  const keys = Object.keys(source);

  for (let index = 0; index < keys.length; index++) {
    if (!(keys[index] in target)) return false;
  }

  return true;
}
