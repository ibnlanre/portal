import type { SetPartial } from "@/create-store/types/set-partial";

export type SetPartialStateAction<State> =
  | ((prevState: State) => SetPartial<State>)
  | SetPartial<State>;
