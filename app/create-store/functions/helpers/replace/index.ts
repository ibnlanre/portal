import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { assign } from "@/create-store/functions/helpers/assign";

export function replace<Target>(target: Target, source: unknown): Target {
  if (isDictionary(target) && isDictionary(source)) {
    return assign(target, source) as Target;
  }

  return source as Target;
}
