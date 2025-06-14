import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { deepMerge } from "@/create-store/functions/helpers/deep-merge";

export function combine<Target>(target: Target, source: unknown): Target {
  const clone = createSnapshot(target);

  if (isDictionary(clone) && isDictionarySlice(clone, source)) {
    return deepMerge(clone, source);
  }

  return source as Target;
}
