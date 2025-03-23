import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

import { isUndefined } from "@/create-store/functions/assertions/is-undefined";
import { createPaths } from "@/create-store/functions/helpers/create-paths";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolveSegment } from "@/create-store/functions/utilities/resolve-segment";

export function resolvePath<
  State extends Dictionary,
  Path extends Paths<State> = never
>(state: State, path?: Path): ResolvePath<State, Path> {
  if (isUndefined(path)) return state as ResolvePath<State, Path>;

  if (!createPaths(state).includes(path)) {
    return undefined as ResolvePath<State, Path>;
  }

  const segments = splitPath(path);
  return resolveSegment(state, segments);
}
