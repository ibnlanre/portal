export function isDefined<Value>(
  value: Value | undefined
): value is Exclude<Value, undefined> {
  return value !== null && value !== undefined;
}
