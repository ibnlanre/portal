import type {
  GetLocalStorage,
  SetLocalStorage,
} from "@/create-store/types/local-storage";
import type { Snapshot } from "@/create-store/types/snapshot";
import type { StorageAdapterOptions } from "@/create-store/types/storage-adapter";

import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createLocalStorageAdapter<State>(
  key: string,
  {
    parse = tryParse,
    stringify = safeStringify,
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

    if (value) return parse(value);

    return fallback;
  }

  const setLocalStorageState = (value?: Snapshot<State>) => {
    if (typeof window === "undefined") return;

    const serializedValue = value === undefined ? undefined : stringify(value);

    try {
      if (serializedValue === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error("Error occurred while writing localStorage:", error);
    }
  };

  return [getLocalStorageState, setLocalStorageState];
}
