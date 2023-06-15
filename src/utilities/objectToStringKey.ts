/**
 * Converts a reference type to a string representation that can be used as a key.
 * 
 * @param {any} value The value to convert.
 * @returns {string} The string representation of the value.
 */
export function objectToStringKey(value: any): string {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      const arrayString = value.map(objectToStringKey).join(",");
      return `[${arrayString}]`;
    } else {
      const objectString = Object.entries(value)
        .map(([key, val]) => `${key}:${objectToStringKey(val)}`)
        .join(",");
      return `{${objectString}}`;
    }
  } else {
    return String(value);
  }
}
