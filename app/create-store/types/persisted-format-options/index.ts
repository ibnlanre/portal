export interface PersistedFormatOptions<State> {
  /**
   * Converts the state of a stored envelope whose version differs from
   * `version`, given the stored version. Without it, or if it throws, such an
   * envelope counts as absent. Only used together with `version`.
   */
  migrate?: (stored: unknown, version: number) => State;
  /**
   * Checks a stored state once it has been unwrapped (and migrated). Return the
   * state to accept it, or `null` or `undefined` to treat it as absent; if it
   * throws, the value is treated as absent and the error is logged. Without it,
   * a stored state with the right shape of envelope is applied as it is, so use
   * it to reject a state of the wrong shape.
   */
  validate?: (state: unknown) => null | State | undefined;
  /**
   * The current schema version. When set, writes are stored as
   * `{ $version, state }` and reads accept only that envelope. Without it,
   * adapters read and write the bare value.
   */
  version?: number;
}
