import type { DeepPartial } from "@/create-store/types/deep-partial";

export type PartialSelector<State, Value = State> = (
  state: DeepPartial<State>
) => Value;
