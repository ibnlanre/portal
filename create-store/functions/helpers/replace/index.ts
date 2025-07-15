import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { combine } from "@/create-store/functions/helpers/combine";

export function replace<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target)) {
    if (isDictionarySlice(target, source)) {
      return combine(target, source) as Target;
    }
  }

  return source as Target;
}
