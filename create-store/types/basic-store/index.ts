import type { Dispatch } from "react";

import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { PartialStateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";

export type BasicStore<State> = {
  readonly $act: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $get: <Value = State>(selector?: Selector<State, Value>) => Value;
  readonly $set: Dispatch<SetPartialStateAction<State>>;
  readonly $use: <Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: unknown[]
  ) => PartialStateManager<State, Value>;
};
