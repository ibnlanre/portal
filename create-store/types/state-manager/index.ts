import type { Dispatch, SetStateAction } from "react";

export type StateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<SetStateAction<State>>
];
