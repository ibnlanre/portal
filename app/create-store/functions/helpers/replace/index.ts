import { isAtomic } from "@/create-store/functions/assertions/is-atomic";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { combine } from "@/create-store/functions/helpers/combine";
import { createAtom } from "@/create-store/functions/library/create-atom";

export function replace<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionary(source)) {
    if (isAtomic(target)) return createAtom(source) as Target;
    return combine(target, source) as Target;
  }

  return source as Target;
}
