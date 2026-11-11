import type {
  GetLocalStorage,
  SetLocalStorage,
} from "@/create-store/types/local-storage";
import type { StorageAdapterOptions } from "@/create-store/types/storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import { createStorageWatcher } from "@/create-store/functions/helpers/create-storage-watcher";
import {
  readPersisted,
  writePersisted,
} from "@/create-store/functions/helpers/persisted-format";
import { registerWatcher } from "@/create-store/functions/helpers/watchers";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function localAdapter<State>(
  key: string,
  {
    migrate,
    parse = tryParse,
    stringify = JSON.stringify,
    validate,
    version,
  }: StorageAdapterOptions<State> = {}
): [
  getLocalStorageState: GetLocalStorage<State>,
  setLocalStorageState: SetLocalStorage<State>,
] {
  function getLocalStorageState(): State | undefined;
  function getLocalStorageState(fallback: State): State;

  // A browser can refuse storage outright (blocked site data, a sandboxed
  // frame) or a write (full storage): reads then fall back and writes are
  // dropped, as cookieStorage does, rather than throwing into the caller.
  function getLocalStorageState(fallback?: State) {
    if (typeof window === "undefined") return fallback;

    let value: null | string = null;

    try {
      value = localStorage.getItem(key);
    } catch (error) {
      console.error("Error occurred while reading localStorage:", error);
    }

    if (!isNullish(value)) {
      const persisted = readPersisted(parse(value), {
        migrate,
        validate,
        version,
      });
      return persisted ?? fallback;
    }

    return fallback;
  }

  const setLocalStorageState = (value?: State) => {
    if (typeof window === "undefined") return;

    const serializedValue =
      value === undefined
        ? undefined
        : stringify(writePersisted(value, version) as State);

    try {
      if (serializedValue === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error("Error occurred while writing localStorage:", error);
    }
  };

  return registerWatcher(
    [getLocalStorageState, setLocalStorageState],
    createStorageWatcher(key, () => localStorage)
  );
}
