import type {
  GetLocalStorage,
  SetLocalStorage,
} from "@/create-store/types/local-storage";
import type { StorageAdapter } from "@/create-store/types/storage-adapter";

import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createLocalStorageAdapter<State>({
  key,
  stringify = safeStringify,
  parse = tryParse,
}: StorageAdapter<State>): [
  getLocalStorageState: GetLocalStorage<State>,
  setLocalStorageState: SetLocalStorage<State>
] {
  function getLocalStorageState(): State | undefined;
  function getLocalStorageState(fallback: State): State;

  function getLocalStorageState(fallback?: State) {
    if (typeof localStorage === "undefined") return fallback;

    const value = localStorage.getItem(key);
    if (value) return parse(value);

    return fallback;
  }

  const setLocalStorageState = (value?: State) => {
    if (typeof localStorage === "undefined") return;
    if (value === undefined) return localStorage.removeItem(key);

    const serializedValue = stringify(value);
    localStorage.setItem(key, serializedValue);
  };

  return [getLocalStorageState, setLocalStorageState];
}
