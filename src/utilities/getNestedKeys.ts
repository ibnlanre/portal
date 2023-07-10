import { Builder } from "../entries";

/**
 * Returns a builder object that represents the nested keys of the provided object.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to traverse and retrieve the nested keys.
 * @param {string[]} [path=[]] - The current path of keys (used internally for recursion).
 * @returns {Builder<T>} - A builder object with callable functions representing the nested keys.
 */
export function createBuilder<T extends Record<string, any>>(
  obj: T,
  path: string[] = []
): Builder<T> {
  const keys = Object.keys(obj) as Array<keyof T>;

  const builder = keys.reduce((acc, key) => {
    const value = obj[key];
    const newPath = [...path, key as string];

    if (typeof value === "function") {
      return {
        ...acc,
        [key]: (...args: Parameters<typeof value>) => [...newPath, ...args],
      };
    }

    if (typeof value === "object" && value !== null) {
      return {
        ...acc,
        [key]: Object.assign(
          { use: () => newPath },
          createBuilder(value, newPath)
        ),
      };
    }

    return {
      ...acc,
      [key]: { use: () => newPath },
    };
  }, {}) as Builder<T>;

  return builder;
}
