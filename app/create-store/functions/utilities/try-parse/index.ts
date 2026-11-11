/**
 * @template ReturnType
 *
 * @description
 * Parses a stored string as JSON. Text that is not valid JSON counts as an
 * absent value: the error is logged through `console.error` and `undefined` is
 * returned, so the adapter falls back instead of handing back the raw text.
 *
 * @param value The value to parse.
 * @returns The parsed value, or `undefined` when it is not valid JSON.
 */
export function tryParse<ReturnType>(value: string): ReturnType | undefined {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Error occurred while parsing stored text as JSON:", error);
    return undefined;
  }
}
