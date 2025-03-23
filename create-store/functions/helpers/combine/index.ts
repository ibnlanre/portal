import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";

export function combine<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionarySlice(source, target)) {
    return shallowMerge(target, source);
  }

  return source as Target;
}
