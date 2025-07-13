import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { combine } from "@/create-store/functions/helpers/combine";

interface ReplaceOptions {
  strictMode?: boolean;
}

export function replace<Target>(
  target: Target,
  source: unknown,
  { strictMode = false }: ReplaceOptions = {}
): Target {
  if (isDictionary(target)) {
    if (isDictionarySlice(target, source)) {
      return combine(target, source);
    }

    if (strictMode) {
      throw new Error(
        "The source object does not match the target dictionary structure."
      );
    }
  }

  return source as Target;
}
