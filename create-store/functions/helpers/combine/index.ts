import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { deepMerge } from "@/create-store/functions/helpers/deep-merge";

export function combine<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionarySlice(target, source)) {
    return deepMerge(target, source);
  }

  return source as Target;
}
