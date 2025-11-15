/**
 * Safely converts a value to a string.
 *
 * @description
 * If the value is already a string, it will return the value as is.
 *
 * @param value The value to convert to a string.
 * @returns The value as a string.
 */
export function safeStringify<ValueType = unknown>(value: ValueType): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
