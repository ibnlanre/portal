import { assertIsDictionary } from "@/create-store/functions//assertions/is-dictionary";
import { sort } from "@/create-store/functions/helpers/sort";

/**
 * Stringifies a value into a string representation.
 *
 * This function handles various data types including primitives, objects, arrays, sets, maps,
 * circular references, and special objects like Date, RegExp, and Error.
 *
 * @param value The value to stringify.
 * @returns A string representation of the value.
 */
export function stringify(value: unknown): string {
  const circularMap = new Map<object, string>();
  let refCounter = 0;

  function format(value: unknown): string {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "symbol":
        return String(value);
      case "function":
        return `Function(${value.toString().replace(/\s+/g, " ")})`;
      case "number":
        return Object.is(value, -0) ? "-0" : String(value);
      case "string":
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      case "undefined":
        return "undefined";
    }

    if (value === null) return "null";

    if (typeof value === "object") {
      if (circularMap.has(value)) {
        return `[Circular:${circularMap.get(value)}]`;
      }

      const refId = `ref_${++refCounter}`;
      circularMap.set(value, refId);

      if (value instanceof Date) {
        return `Date("${value.toISOString()}")`;
      }

      if (value instanceof RegExp) {
        return value.toString();
      }

      if (value instanceof Error) {
        return `Error("${value.message}")`;
      }

      if (value instanceof Set) {
        if (!value.size) return "Set()";

        const elements: string[] = [];
        for (const item of value) {
          elements.push(format(item));
        }
        sort(elements);

        let result = "Set([";
        for (let index = 0; index < elements.length; index++) {
          if (index > 0) result += ",";
          result += elements[index];
        }
        return result + "])";
      }

      if (value instanceof Map) {
        if (!value.size) return "Map()";

        const entries: string[] = [];
        for (const [key, item] of value) {
          entries.push(`[${format(key)},${format(item)}]`);
        }
        sort(entries);

        let result = "Map([";
        for (let index = 0; index < entries.length; index++) {
          if (index > 0) result += ",";
          result += entries[index];
        }
        return result + "])";
      }

      if (Array.isArray(value)) {
        if (!value.length) return "[]";

        const entries: string[] = [];
        for (let index = 0; index < value.length; index++) {
          entries.push(format(value[index]));
        }
        sort(entries);

        let result = "[";
        for (let index = 0; index < entries.length; index++) {
          if (index > 0) result += ",";
          result += entries[index];
        }
        return result + "]";
      }

      assertIsDictionary(value);
      const keys = Object.keys(value);
      if (!keys.length) return "{}";

      const properties: string[] = [];
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        properties.push(`${key}:${format(value[key])}`);
      }
      sort(properties);

      let result = "{";
      for (let index = 0; index < properties.length; index++) {
        if (index > 0) result += ",";
        result += properties[index];
      }
      return result + "}";
    }

    return String(value);
  }

  const result = format(value);
  circularMap.clear();
  return result;
}
