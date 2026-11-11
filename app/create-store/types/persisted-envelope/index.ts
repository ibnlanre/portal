/** What an adapter stores when a `version` is set. */
export interface PersistedEnvelope<State> {
  readonly $version: number;
  readonly state: State;
}
