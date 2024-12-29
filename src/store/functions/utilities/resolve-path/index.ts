import type { Dictionary } from "@/store/types/dictionary";
import type { Paths } from "@/store/types/paths";
import type { ResolvePath } from "@/store/types/resolve-path";

import { splitPath } from "@/store/functions/helpers/split-path";
import { resolveSegment } from "@/store/functions/utilities/resolve-segment";

export function resolvePath<
  State extends Dictionary,
  Path extends Paths<State> = never
>(state: State, path: Path): ResolvePath<State, Path> {
  const segments = splitPath(path);
  return resolveSegment(state, segments);
}
