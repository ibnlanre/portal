import type {
  BrowserStorageAdapter,
  GetBrowserStorage,
  SetBrowserStorage,
} from "@/create-store/types/storage-adapter";

import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createBrowserStorageAdapter<State>({
  key,
  stringify = safeStringify,
  parse = tryParse,
  ...storage
}: BrowserStorageAdapter<State>): [
  getStorageState: GetBrowserStorage<State>,
  setStorageState: SetBrowserStorage<State>
] {
  function getStorageState(): State | undefined;
  function getStorageState(fallback: State): State;

  function getStorageState(fallback?: State) {
    const value = storage.getItem(key);
    if (value) return parse(value);

    return fallback;
  }

  const setStorageState = (value?: State) => {
    if (value === undefined) return storage.removeItem(key);

    const serializedValue = stringify(value);
    storage.setItem(key, serializedValue);
  };

  return [getStorageState, setStorageState];
}
