import { isAtomic } from "@/create-store/functions/assertions/is-atomic";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { assign } from "@/create-store/functions/helpers/assign";
import { createAtom } from "@/create-store/functions/library/create-atom";

export function replace<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionary(source)) {
    if (isAtomic(target)) return createAtom(source) as Target;
    return assign(target, source) as Target;
  }

  return source as Target;
}
