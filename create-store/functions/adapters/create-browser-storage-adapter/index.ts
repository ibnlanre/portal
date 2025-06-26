import type {
  BrowserStorageAdapterOptions,
  GetBrowserStorage,
  SetBrowserStorage,
} from "@/create-store/types/browser-storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createBrowserStorageAdapter<State>(
  key: string,
  {
    getItem,
    parse = tryParse,
    removeItem,
    setItem,
    stringify = safeStringify,
  }: BrowserStorageAdapterOptions<State>
): [
  getStorageState: GetBrowserStorage<State>,
  setStorageState: SetBrowserStorage<State>,
] {
  function getStorageState(fallback: State): State;
  function getStorageState(fallback?: State): State | undefined;

  function getStorageState(fallback?: State) {
    const value = getItem(key);
    if (isNullish(value)) return fallback;
    return parse(value);
  }

  const setStorageState = (value?: State) => {
    if (value === undefined) return removeItem(key);
    const serializedValue = stringify(value);
    setItem(key, serializedValue);
  };

  return [getStorageState, setStorageState];
}
