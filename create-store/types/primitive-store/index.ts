import type { Selector } from "@/create-store/types/selector";
import type { StateManager } from "@/create-store/types/state-manager";
import type {
  FilteredStore,
  StoreHandles,
} from "@/create-store/types/store-handles";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch, SetStateAction } from "react";

interface PrimitiveStoreMethods<State> {
  readonly $get: <Value = State>(selector?: Selector<State, Value>) => Value;
  readonly $set: Dispatch<SetStateAction<State>>;
  readonly $act: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $use: <Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: unknown[]
  ) => StateManager<State, Value>;
}

export type PrimitiveStore<
  State,
  Handles extends StoreHandles = ["$act", "$get", "$set", "$use"]
> = FilteredStore<PrimitiveStoreMethods<State>, Handles>;
