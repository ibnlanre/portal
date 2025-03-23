import type { OmitCallableProperties } from "@/create-store/types/omit-callable-properties";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch } from "react";

export interface PrimitiveStore<State> {
  readonly $get: <Value = State>(select?: Selector<State, Value>) => Value;
  readonly $set: Dispatch<SetPartialStateAction<OmitCallableProperties<State>>>;
  readonly $sub: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $use: <Value = State>(
    select?: Selector<State, Value>,
    dependencies?: unknown[]
  ) => StateManager<State, Value>;
}
