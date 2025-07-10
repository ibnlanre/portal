import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { Dictionary } from "@/create-store/types/dictionary";

import { isPrimitive } from "@/create-store/functions/assertions/is-primitive";

export function isDictionarySlice<Target extends Dictionary>(
  target: Target,
  source: unknown
): source is DeepPartial<Target> {
  if (isPrimitive(source)) return false;

  const keys = Object.keys(source);

  for (let index = 0; index < keys.length; index++) {
    if (!(keys[index] in target)) return false;
  }

  return true;
}
