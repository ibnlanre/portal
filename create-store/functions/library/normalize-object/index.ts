import type { Dictionary } from "@/create-store/types/dictionary";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Normalize } from "@/create-store/types/normalize";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isObject } from "@/create-store/functions/assertions/is-object";

function normalizeValue<State extends Dictionary>(
  state: State,
  seen = new WeakMap()
): Partial<State> {
  if (seen.has(state)) {
    return seen.get(state) as Partial<State>;
  }

  const normalizedState: Partial<State> = {};

  seen.set(state, normalizedState);

  for (const key of Reflect.ownKeys(state)) {
    try {
      if (typeof key === "symbol") {
        continue;
      }

      const value = Reflect.get(state, key);

      if (typeof value === "function") {
        continue;
      }

      if (!isDictionary(value)) {
        Reflect.set(normalizedState, key, value);
        continue;
      }

      const normalizedValue = normalizeValue(value, seen);
      Reflect.set(normalizedState, key, normalizedValue);
    } catch {
      continue;
    }
  }

  return normalizedState as Normalize<State>;
}

export function normalizeObject<State extends GenericObject>(
  state: State
): Normalize<State> {
  if (!isObject(state)) {
    throw new Error("State must be an object");
  }

  return normalizeValue(state) as Normalize<State>;
}
