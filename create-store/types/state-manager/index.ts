import type { Dispatch, SetStateAction } from "react";

import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";

export type PartialStateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<SetPartialStateAction<State>>,
];

export type StateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<SetStateAction<State>>,
];
