export function isEnabled<Value>(
  value: Value
): value is Exclude<Value, false | undefined | null> {
  return value !== null && value !== undefined && value !== false;
}
