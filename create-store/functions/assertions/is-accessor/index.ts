type Accessor = "$act" | "$get" | "$set" | "$use";

export function isAccessor(value: PropertyKey): value is Accessor {
  return typeof value === "string" && value.startsWith("$");
}
