import type { StorageChange } from "@/create-store/types/storage-change";
import type { StorageWatcher } from "@/create-store/types/storage-watcher";

/** Tells other tabs about a write, and hears theirs. */
export interface Channel {
  /** Announces a change made here; never fails the caller. */
  post: (change: StorageChange) => void;
  /** Hears changes announced elsewhere; the returned function stops hearing. */
  watch: StorageWatcher;
}
