import type { DeepPartial } from "../deep-partial";

export type SetPartialStateAction<State> =
  | DeepPartial<State>
  | ((prevState: State) => DeepPartial<State>);
