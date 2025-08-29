import type { DependencyList } from "react";

import type { AtomicStateManager } from "@/create-store/types/atomic-state-manager";
import type { AtomicStateSetter } from "@/create-store/types/atomic-state-setter";
import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { PartialSelector } from "@/create-store/types/partial-selector";
import type { Selector } from "@/create-store/types/selector";
import type { Subscriber } from "@/create-store/types/subscriber";

export interface AtomicStore<State> {
  readonly $act: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $get: <Value = DeepPartial<State>>(
    selector?: PartialSelector<State, Value>
  ) => Value;
  readonly $set: AtomicStateSetter<State>;
  readonly $use: <Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: DependencyList
  ) => AtomicStateManager<State, Value>;
}
