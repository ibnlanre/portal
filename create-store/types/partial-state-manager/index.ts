import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";

export type PartialStateManager<State, Value = State> = [
  state: Value,
  dispatcher: PartialStateSetter<State>,
];
