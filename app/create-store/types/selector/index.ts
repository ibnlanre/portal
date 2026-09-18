import type { Snapshot } from "@/create-store/types/snapshot";
export type Selector<State, Value = Snapshot<State>> = (
  state: Snapshot<State>
) => Value;
