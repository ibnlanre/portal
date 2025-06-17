import type { Dispatch } from "react";

import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";

export type PartialStateSetter<State> = Dispatch<SetPartialStateAction<State>>;
