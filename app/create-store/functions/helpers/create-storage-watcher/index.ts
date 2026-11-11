import type { StorageWatcher } from "@/create-store/types/storage-watcher";

/**
 * Listens for `storage` events about one key of one storage area. A `clear()`
 * (event key `null`) and a removed key both report `removed`. Events it cannot
 * attribute to the area, because the browser refuses the area, are ignored.
 * No-ops where there is no `window`.
 */
export function createStorageWatcher(
  key: string,
  area: () => Storage
): StorageWatcher {
  return (listener) => {
    if (typeof window === "undefined") return () => {};

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return;
      if (event.storageArea && event.storageArea !== readArea(area)) return;
      listener({ removed: event.key === null || event.newValue === null });
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  };
}

/** The storage area, or undefined where the browser refuses it. */
function readArea(area: () => Storage): Storage | undefined {
  try {
    return area();
  } catch {
    return undefined;
  }
}
