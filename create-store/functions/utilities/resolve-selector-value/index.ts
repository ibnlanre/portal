import type { Selector } from "@/create-store/types/selector";

export function resolveSelectorValue<State, Value = State>(
  state: State,
  select?: Selector<State, Value>
): Value {
  if (select) return select(state);
  return state as unknown as Value;
}
