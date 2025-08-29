import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { splitPath } from "@/create-store/functions/helpers/split-path";

/**
 * Resolves a path in a given state object and returns the value at that path.
 *
 * @description
 * This function takes a state object and a path, which can be a string or an array of strings,
 * and traverses the state object to find the value at the specified path. If the path does not exist,
 * it returns undefined. If no path is provided, it returns the entire state object.
 *
 * @param state The state object to resolve the path in.
 * @param path The path to resolve, represented as a string or an array of strings.
 *
 * @returns The value at the resolved path, or undefined if the path does not exist.
 */
export function resolvePath<
  State extends GenericObject,
  Path extends Paths<State> = never,
>(state: State, path?: Path): ResolvePath<State, Path> {
  if (!path) return state as ResolvePath<State, Path>;

  const segments = splitPath(path);
  let current: any = state;

  for (const key of segments) {
    if (!isDictionary(current) || !(key in current)) {
      return undefined as ResolvePath<State, Path>;
    }
    current = current[key];
  }

  return current as ResolvePath<State, Path>;
}
