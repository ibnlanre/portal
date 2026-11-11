import type {
  BrowserStorageAdapterOptions,
  GetBrowserStorage,
  SetBrowserStorage,
} from "@/create-store/types/browser-storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import {
  readPersisted,
  writePersisted,
} from "@/create-store/functions/helpers/persisted-format";
import { registerWatcher } from "@/create-store/functions/helpers/watchers";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function customAdapter<State>(
  key: string,
  {
    getItem,
    migrate,
    parse = tryParse,
    removeItem,
    setItem,
    stringify = JSON.stringify,
    validate,
    version,
    watch,
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

    const persisted = readPersisted(parse(value), {
      migrate,
      validate,
      version,
    });
    return persisted ?? fallback;
  }

  const setStorageState = (value?: State) => {
    if (value === undefined) removeItem(key);
    else setItem(key, stringify(writePersisted(value, version) as State));
  };

  return registerWatcher([getStorageState, setStorageState], watch);
}
