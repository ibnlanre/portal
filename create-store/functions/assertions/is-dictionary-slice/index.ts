import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import type { Dictionary } from "@/create-store/types/dictionary";

export function isDictionarySlice<Target extends Dictionary>(
  source: unknown,
  target: Target
): source is Partial<Target> {
  if (!isDictionary(source)) return false;
  return Object.keys(source).every((key) => key in target);
}
