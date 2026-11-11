import type { StorageChange } from "@/create-store/types/storage-change";

/** Subscribes to external changes; returns a function that stops listening. */
export type StorageWatcher = (
  listener: (change: StorageChange) => void
) => () => void;
