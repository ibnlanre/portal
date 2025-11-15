import type { Accessor } from "@/create-store/types/accessor";

export function isAccessor<Target extends Record<string, any>>(
  target: Target,
  prop: string | symbol
): prop is Accessor {
  if (typeof prop === "symbol") return false;
  return prop.startsWith("$") && prop in target;
}
