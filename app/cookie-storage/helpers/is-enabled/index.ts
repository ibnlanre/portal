export function isEnabled<Value>(
  value: Value
): value is Exclude<Value, false | null | undefined> {
  return value !== null && value !== undefined && value !== false;
}
