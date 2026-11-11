import type {
  AsyncBrowserStorageAdapterOptions,
  AsyncGetBrowserStorage,
  AsyncSetBrowserStorage,
} from "@/create-store/types/async-browser-storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import { channel } from "@/create-store/functions/helpers/channel";
import {
  readPersisted,
  writePersisted,
} from "@/create-store/functions/helpers/persisted-format";
import { registerWatcher } from "@/create-store/functions/helpers/watchers";

export function asyncAdapter<State, StoredState = State>(
  key: string,
  {
    beforeStorage = (value: State) => value as unknown as StoredState,
    beforeUsage = (value: StoredState) => value as unknown as State,
    getItem,
    migrate,
    removeItem,
    setItem,
    validate,
    version,
    watch,
  }: AsyncBrowserStorageAdapterOptions<State, StoredState>
): [
  getStorageState: AsyncGetBrowserStorage<State>,
  setStorageState: AsyncSetBrowserStorage<State>,
] {
  async function getStorageState(fallback: State): Promise<State>;
  async function getStorageState(fallback?: State): Promise<State | undefined>;

  async function getStorageState(fallback?: State): Promise<State | undefined> {
    const value = await getItem(key);
    if (isNullish(value)) return fallback;

    const persisted = readPersisted(beforeUsage(value), {
      migrate,
      validate,
      version,
    });
    return persisted ?? fallback;
  }

  const bus = watch === true ? channel(key) : undefined;

  async function setStorageState(value?: State): Promise<void> {
    if (value === undefined) await removeItem(key);
    else {
      await setItem(
        key,
        beforeStorage(writePersisted(value, version) as State)
      );
    }
    bus?.post({ removed: value === undefined });
  }

  return registerWatcher(
    [getStorageState, setStorageState],
    bus ? bus.watch : typeof watch === "function" ? watch : undefined
  );
}
