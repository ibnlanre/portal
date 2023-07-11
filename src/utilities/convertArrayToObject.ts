import { NestedObject } from "entries";

/**
 * Converts an array of strings into a nested object.
 *
 * @param {any[]} prefix The array of strings to serve as the root.
 * @param {Record<string, any>} obj The object which would become nested within.
 * @returns {object} The nested object with the keys from the array.
 */
export function convertArrayToObject<
  T extends Record<string, any>,
  P extends string[]
>(obj: T, prefix?: P) {
  return prefix
    ? (prefix.reduceRight<T>(
        (acc, key) => ({ [key]: acc } as NestedObject<T, P>),
        obj
      ) as NestedObject<T, P>)
    : obj;
}
