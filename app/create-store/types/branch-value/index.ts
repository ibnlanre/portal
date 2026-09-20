/** Index signatures describe possible entries, not a populated dictionary. */
export type BranchValue<State, Key extends keyof State> =
  | State[Key]
  | (string extends keyof State
      ? undefined
      : number extends keyof State
        ? undefined
        : never);
