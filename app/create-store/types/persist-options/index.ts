export interface PersistOptions<State> {
  /** Runs after a stored state has been applied, or found to be absent. */
  onHydrated?: (state: State) => void;
  /**
   * Leave the store at its initial value until `hydrate()` is called, so a
   * server render and the first client render agree.
   */
  skipHydration?: boolean;
  /**
   * A persisted store follows its storage: a change made elsewhere (another tab
   * or window, for local storage) is written to the store, and nothing is
   * written back. A removed value resets the store to its initial value. Pass
   * `false` to opt out. An adapter that cannot announce changes is never
   * followed.
   */
  sync?: false;
}
