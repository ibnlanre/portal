import type { DeepPartial } from "@/create-store/types/deep-partial";

export type PartialSetStateAction<State> =
  | ((prevState: State) => DeepPartial<State>)
  | DeepPartial<State>;
