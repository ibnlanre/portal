import type { Dictionary } from "@/create-store/types/dictionary";

export function createSnapshot<State extends Dictionary>(state: State): State {
  return Object.create(
    Object.getPrototypeOf(state),
    Object.getOwnPropertyDescriptors(state)
  );
}
