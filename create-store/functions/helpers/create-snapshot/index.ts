import type { Dictionary } from "@/create-store/types/dictionary";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

export function createSnapshot<State extends Dictionary>(state: State): State {
  const snapshot = Object.create(
    Object.getPrototypeOf(state),
    Object.getOwnPropertyDescriptors(state)
  );

  Object.keys(snapshot).forEach((key) => {
    const value = snapshot[key];
    if (isDictionary(value)) {
      snapshot[key] = createSnapshot(value);
    }
  });

  return snapshot;
}
