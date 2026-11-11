import type {
  GetSessionStorage,
  SetSessionStorage,
} from "@/create-store/types/session-storage";
import type { StorageAdapterOptions } from "@/create-store/types/storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import {
  readPersisted,
  writePersisted,
} from "@/create-store/functions/helpers/persisted-format";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function sessionAdapter<State>(
  key: string,
  {
    migrate,
    parse = tryParse,
    stringify = JSON.stringify,
    validate,
    version,
  }: StorageAdapterOptions<State> = {}
): [
  getSessionStorageState: GetSessionStorage<State>,
  setSessionStorageState: SetSessionStorage<State>,
] {
  function getSessionStorageState(): State | undefined;
  function getSessionStorageState(fallback: State): State;

  // A browser can refuse storage outright (blocked site data, a sandboxed
  // frame) or a write (full storage): reads then fall back and writes are
  // dropped, as cookieStorage does, rather than throwing into the caller.
  function getSessionStorageState(fallback?: State) {
    if (typeof window === "undefined") return fallback;

    let value: null | string = null;

    try {
      value = sessionStorage.getItem(key);
    } catch (error) {
      console.error("Error occurred while reading sessionStorage:", error);
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

  const setSessionStorageState = (value?: State) => {
    if (typeof window === "undefined") return;

    const serializedValue =
      value === undefined
        ? undefined
        : stringify(writePersisted(value, version) as State);

    try {
      if (serializedValue === undefined) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error("Error occurred while writing sessionStorage:", error);
    }
  };

  return [getSessionStorageState, setSessionStorageState];
}
