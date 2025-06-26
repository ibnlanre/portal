import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";
import type { Selector } from "@/create-store/types/selector";
import type { PartialStateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";

/**
 * @deprecated
 *
 * Use `PrimitiveStore` instead.
 * This type is kept for backward compatibility.
 * It will be removed in a future version.
 */
export type BasicStore<State> = {
  readonly $act: (
    subscriber: Subscriber<State>,
    immediate?: boolean
  ) => () => void;
  readonly $get: <Value = State>(selector?: Selector<State, Value>) => Value;
  readonly $set: PartialStateSetter<State>;
  readonly $use: <Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: unknown[]
  ) => PartialStateManager<State, Value>;
};
