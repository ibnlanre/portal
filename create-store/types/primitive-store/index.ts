import type { DependencyList } from "react";

import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";
import type { Selector } from "@/create-store/types/selector";
import type { Subscriber } from "@/create-store/types/subscriber";

export type PrimitiveStore<State> = {
  readonly $act: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $get: <Value = State>(selector?: Selector<State, Value>) => Value;
  readonly $set: PartialStateSetter<State>;
  readonly $use: <Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: DependencyList
  ) => PartialStateManager<State, Value>;
};
