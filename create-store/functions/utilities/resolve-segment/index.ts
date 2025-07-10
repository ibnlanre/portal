import type { Dictionary } from "@/create-store/types/dictionary";
import type { ResolveSegment } from "@/create-store/types/resolve-segment";
import type { Segments } from "@/create-store/types/segments";

export function resolveSegment<
  State extends Dictionary,
  Keys extends Segments<State>,
>(state: State, keys: Keys): ResolveSegment<State, Keys> {
  let current: any = state;

  for (let index = 0; index < keys.length; index++) {
    current = current[keys[index]];
  }

  return current as ResolveSegment<State, Keys>;
}
