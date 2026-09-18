import type { Snapshot } from "@/create-store/types/snapshot";
import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";

export type PartialStateManager<State, Value = Snapshot<State>> = [
  state: Value,
  dispatcher: PartialStateSetter<State>,
];
