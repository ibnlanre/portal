import type { Selector } from "@/create-store/types/selector";

import { isFunction } from "@/create-store/functions/assertions/is-function";
import { clone } from "@/create-store/functions/helpers/clone";

export function resolveSelectorValue<State, Value = State>(
  state: State,
  selector?: Selector<State, Value>,
  cache?: WeakMap<object, any>
) {
  const value = clone(state, cache);
  if (isFunction(selector)) return selector(value);
  return value as unknown as Value;
}
