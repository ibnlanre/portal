import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { PartialStateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch } from "react";

export interface BasicStore<State> {
  readonly $get: <Value = State>(select?: Selector<State, Value>) => Value;
  readonly $sub: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $set: Dispatch<SetPartialStateAction<State>>;
  readonly $use: <Value = State>(
    select?: Selector<State, Value>,
    dependencies?: unknown[]
  ) => PartialStateManager<State, Value>;
}
