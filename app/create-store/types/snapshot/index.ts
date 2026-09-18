/** A shared, read-only view of store data. Mutate through $set instead. */
export type Snapshot<State> = State extends (...args: any[]) => any
  ? State
  : State extends ReadonlyMap<infer Key, infer Value>
    ? ReadonlyMap<Snapshot<Key>, Snapshot<Value>>
    : State extends ReadonlySet<infer Value>
      ? ReadonlySet<Snapshot<Value>>
      : State extends object
        ? { readonly [Key in keyof State]: Snapshot<State[Key]> }
        : State;
