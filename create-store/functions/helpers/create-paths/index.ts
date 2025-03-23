import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

export function createPaths<Store extends Dictionary>(
  store: Store,
  prefix: string[] = []
): Paths<Store> {
  const paths: string[] = [];

  for (const key in store) {
    const nextPrefix = [...prefix, key].join(".");
    const value = store[key];

    if (isDictionary(value)) {
      const nestedPaths = createPaths(value, [...prefix, key]);
      paths.push(nextPrefix, ...nestedPaths);
    } else paths.push(nextPrefix);
  }

  return paths as unknown as Paths<Store>;
}
