import type { Selector } from "@/create-store/types/selector";

import { isFunction } from "@/create-store/functions/assertions/is-function";

import clone from "@ibnlanre/clone";

export function resolveSelectorValue<State, Value = State>(
  state: State,
  selector?: Selector<State, Value>
) {
  const value = clone(state);
  if (isFunction(selector)) return selector(value);
  return value as unknown as Value;
}
