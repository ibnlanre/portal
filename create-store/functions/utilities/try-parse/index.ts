/**
 * @template ReturnType
 *
 * @description
 * If the value is a string, it will attempt to parse it as JSON. If it fails, it will return the value as is.
 *
 * @param value The value to parse.
 * @returns The parsed value.
 */
export function tryParse<ReturnType>(value: string): ReturnType {
  try {
    return JSON.parse(value);
  } catch {
    return value as ReturnType;
  }
}
