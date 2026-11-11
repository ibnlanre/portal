import type { Selector } from "@/create-store/types/selector";

import { isFunction } from "@/create-store/functions/assertions/is-function";

export function resolveSelectorValue<State, Value = State>(
  state: State,
  selector?: Selector<State, Value>
) {
  if (isFunction(selector)) return selector(state);
  return state as unknown as Value;
}
