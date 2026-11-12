/**
 * A value held by reference that no one subscribes to: a promise queue, a
 * database handle. It is readable and writable, never notifies, and is not part
 * of the state of a composite that holds it.
 */
export interface RefStore<Value> {
  /** Ends the ref: later writes do nothing and the value stays readable. */
  readonly $dispose: () => void;
  readonly $get: () => Value;
  /** Runs `cleanup` when the ref is disposed; returns a function that removes it. */
  readonly $onDispose: (cleanup: () => void) => () => void;
  /** Swaps the value. A function is stored as a value, never called. */
  readonly $set: (value: Value) => void;
}
