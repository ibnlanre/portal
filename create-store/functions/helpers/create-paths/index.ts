import type { Dictionary } from "@/create-store/types/dictionary";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

/**
 * Creates an array of paths from a given store object.
 *
 * @description
 * This function recursively traverses the store object and generates a list of paths
 *
 * @param store The store object to create paths from.
 * @param prefix An array of strings representing the current path prefix.
 * @param visited A WeakSet to track visited objects and prevent cyclic references.
 *
 * @returns An array of strings representing the paths in the store object.
 */
export function createPaths<Store extends Dictionary>(
  store: Store,
  prefix: string[] = [],
  visited = new WeakSet()
): string[] {
  if (!isDictionary(store)) return [];

  const paths: string[] = [];

  for (const key in store) {
    const value = store[key];
    const path = [...prefix, key].join(".");

    paths.push(path);

    if (isDictionary(value)) {
      if (visited.has(value)) continue;
      visited.add(value);
      paths.push(...createPaths(value, [...prefix, key], visited));
    }
  }

  return paths;
}
