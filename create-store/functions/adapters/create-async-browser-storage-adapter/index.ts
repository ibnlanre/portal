import type {
  AsyncBrowserStorageAdapterOptions,
  AsyncGetBrowserStorage,
  AsyncSetBrowserStorage,
} from "@/create-store/types/async-browser-storage-adapter";

import { isNullish } from "@/create-store/functions/assertions/is-nullish";

export function createAsyncBrowserStorageAdapter<State, StoredState = State>(
  key: string,
  {
    getItem,
    removeItem,
    setItem,
    storageTransform = (value: State) => value as unknown as StoredState,
    usageTransform = (value: StoredState) => value as unknown as State,
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
    return usageTransform(value);
  }

  async function setStorageState(value?: State): Promise<void> {
    if (value === undefined) return removeItem(key);
    const transformedValue = storageTransform(value);
    await setItem(key, transformedValue);
  }

  return [getStorageState, setStorageState];
}
