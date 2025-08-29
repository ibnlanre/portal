import type { Dispatch } from "react";

import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";

export type PartialStateManager<State, Value = State> = [
  state: Value,
  dispatcher: Dispatch<PartialSetStateAction<State>>,
];
