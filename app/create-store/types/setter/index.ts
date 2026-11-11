/**
 * Writes to a store, with one meaning per kind: a primitive swaps its whole
 * value; a composite writes each listed branch by that branch's own rule and
 * leaves the others alone; a collection writes the listed entries and creates
 * missing ones. The updater receives the current state and returns the same
 * argument type.
 */
export type Setter<State, Input = State> = (
  action: ((previous: State) => Input) | Input
) => void;
