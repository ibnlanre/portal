/** The state a store reads as. */
export type StoreState<Value> = Value extends {
  $subscribe: (subscriber: (value: infer State) => void, ...rest: any[]) => any;
}
  ? State
  : never;
