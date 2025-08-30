type Accessor = "$act" | "$get" | "$set" | "$sub" | "$use";

export function isAccessor<Target extends Record<string, any>>(
  target: Target,
  prop: string | symbol
): prop is Accessor {
  if (typeof prop === "string") {
    return prop.startsWith("$") && prop in target;
  }

  return false;
}
