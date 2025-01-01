import type { Dictionary } from "@/create-store/types/dictionary";
import type { ResolveSegment } from "@/create-store/types/resolve-segment";
import type { Segments } from "@/create-store/types/segments";

export function resolveSegment<
  State extends Dictionary,
  Keys extends Segments<State>
>(state: State, keys: Keys): ResolveSegment<State, Keys> {
  for (const key of keys) state = state[key] as State;
  return <ResolveSegment<State, Keys>>state;
}
