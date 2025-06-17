import type { DeepPartial } from "../deep-partial";

export type SetPartialStateAction<State> =
  | ((prevState: State) => DeepPartial<State>)
  | DeepPartial<State>;
