import type { Snapshot } from "@/create-store/types/snapshot";
import type { DependencyList } from "react";

import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";
import type { Selector } from "@/create-store/types/selector";
import type { Subscriber } from "@/create-store/types/subscriber";

export type PrimitiveStore<State> = {
  readonly $get: {
    (): Snapshot<State>;
    <Value>(selector: Selector<State, Value>): Value;
  };
  readonly $set: PartialStateSetter<State>;
  readonly $subscribe: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $use: {
    (): PartialStateManager<State>;
    <Value>(
      selector: Selector<State, Value>,
      dependencies?: DependencyList
    ): PartialStateManager<State, Value>;
  };
};
