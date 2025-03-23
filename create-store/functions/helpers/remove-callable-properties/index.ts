import type { Dictionary } from "@/create-store/types/dictionary";
import type { OmitCallableProperties } from "@/create-store/types/omit-callable-properties";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

export function removeCallableProperties<State extends Dictionary>(
  state: State,
  snapshot: Dictionary = {}
): OmitCallableProperties<State> {
  Object.keys(state).forEach((key) => {
    const value = state[key];

    if (typeof value === "function") return;
    if (isDictionary(value)) {
      snapshot[key] = removeCallableProperties(value);
    } else snapshot[key] = value;
  });

  return snapshot as OmitCallableProperties<State>;
}
