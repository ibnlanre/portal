import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { Dispatch, SetStateAction } from "react";

export type StateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<SetStateAction<State>>
];

export type PartialStateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<SetPartialStateAction<State>>
];
