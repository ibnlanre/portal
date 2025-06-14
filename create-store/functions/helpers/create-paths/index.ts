import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

export function createPaths<Store>(
  store: Store,
  prefix: string[] = [],
  visited = new WeakSet()
): string[] {
  const paths: string[] = [];

  for (const key in store) {
    const nextPrefix = [...prefix, key].join(".");
    const value = store[key];

    if (isDictionary(value)) {
      if (visited.has(value)) {
        paths.push(nextPrefix);
        continue;
      }

      visited.add(value);
      const nestedPaths = createPaths(value, [...prefix, key], visited);
      paths.push(nextPrefix, ...nestedPaths);
    } else paths.push(nextPrefix);
  }

  return paths;
}
