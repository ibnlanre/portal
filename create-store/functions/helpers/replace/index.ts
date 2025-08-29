import { isAtomic } from "@/create-store/functions/assertions/is-atomic";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { combine } from "@/create-store/functions/helpers/combine";
import { atom } from "@/create-store/functions/library/atom";

export function replace<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionary(source)) {
    if (isAtomic(target)) return atom(source) as Target;
    return combine(target, source) as Target;
  }

  return source as Target;
}
