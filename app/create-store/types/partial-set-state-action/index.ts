import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { Snapshot } from "@/create-store/types/snapshot";

export type PartialSetStateAction<State> =
  | ((prevState: State) => DeepPartial<State> | Snapshot<DeepPartial<State>>)
  | DeepPartial<State>
  | Snapshot<DeepPartial<State>>;
