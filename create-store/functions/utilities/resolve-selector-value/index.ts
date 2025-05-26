import type { Selector } from "@/create-store/types/selector";

export function resolveSelectorValue<State, Value = State>(
  state: State,
  selector?: Selector<State, Value>
): Value {
  if (selector) return selector(state);
  return state as unknown as Value;
}
