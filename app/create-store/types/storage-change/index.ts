/** Reports that the stored value changed elsewhere (another tab, a poller). */
export interface StorageChange {
  /** The value was removed rather than replaced. */
  removed: boolean;
}
