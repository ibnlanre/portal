import type {
  GetSessionStorage,
  SessionStorageAdapter,
  SetSessionStorage,
} from "@/create-store/types/session-storage";

import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createSessionStorageAdapter<State>(
  /**
   * The key to use in session storage.
   */
  key: string,
  {
    stringify = safeStringify,
    parse = tryParse,
  }: SessionStorageAdapter<State> = {}
): [
  getSessionStorageState: GetSessionStorage<State>,
  setSessionStorageState: SetSessionStorage<State>
] {
  function getSessionStorageState(): State | undefined;
  function getSessionStorageState(fallback: State): State;

  function getSessionStorageState(fallback?: State) {
    if (typeof sessionStorage === "undefined") return fallback;

    const value = sessionStorage.getItem(key);
    if (value) return parse(value);

    return fallback;
  }

  const setSessionStorageState = (value?: State) => {
    if (typeof sessionStorage === "undefined") return;
    if (value === undefined) return sessionStorage.removeItem(key);

    const serializedValue = stringify(value);
    sessionStorage.setItem(key, serializedValue);
  };

  return [getSessionStorageState, setSessionStorageState];
}