export type SetPartialStateAction<State> =
  | Partial<State>
  | ((prevState: State) => Partial<State>);
