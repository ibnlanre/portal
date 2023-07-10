import { Builder } from "../entries";

/**
 * Returns a builder object that represents the nested keys of the provided object.
 *
 * @template T The type of the object.
 * 
 * @param {T} obj The object to traverse and retrieve the nested keys.
 * @param {string[]} [prefix=[]] An optional prefix to prepend to keys array in the builder object.
 *
 * @returns {Builder<T>} A builder object with callable functions representing the nested keys.
 *
 * @summary By using the createBuilder function, you can define nested keys and associated values, allowing you to build complex key structures for various purposes.
 * @description The builder object can be used to enforce type safety and provide auto-completion support when working with the defined keys.
 */
export function createBuilder<T extends Record<string, any>>(
  obj: T,
  prefix: string[] = []
): Builder<T> {
  const keys = Object.keys(obj) as Array<keyof T>;

  const builder = keys.reduce((acc, key) => {
    const value = obj[key];
    const newPath = [...prefix, key as string];

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
