import type { DeepPartial } from "@/create-store/types/deep-partial";

/**
 * @deprecated Use `PartialSetStateAction` instead.
 */
export type SetPartialStateAction<State> =
  | ((prevState: State) => DeepPartial<State>)
  | DeepPartial<State>;
