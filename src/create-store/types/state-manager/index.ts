import type { Dispatch, SetStateAction } from "react";

export type StateManager<State> = [
  state: State,
  dispatcher: Dispatch<SetStateAction<State>>
];
