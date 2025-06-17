import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import type {
  CookieStorageAdapterOptions,
  GetCookieStorage,
  SetCookieStorage,
} from "@/create-store/types/cookie-storage";

import { cookieStorage } from "@/cookie-storage";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";
import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createCookieStorageAdapter<State>(
  key: string,
  {
    parse = tryParse,
    secret,
    signed = false,
    stringify = safeStringify,
    ...cookieOptions
  }: CookieStorageAdapterOptions<State> = {} as CookieStorageAdapterOptions<State>
): [
  getCookieStorageState: GetCookieStorage<State>,
  setCookieStorageState: SetCookieStorage<State>,
] {
  const cookieOptionsMap = new Map<string, CookieOptions>();

  const retrieveCookieOptions = (key: string): CookieOptions => {
    const options = cookieOptionsMap.get(key);
    if (options) return options;
    return cookieOptions;
  };

  function getCookieStorageState(): State | undefined;
  function getCookieStorageState(fallback: State): State;

  function getCookieStorageState(fallback?: State) {
    const value = cookieStorage.getItem(key);
    if (!value) return fallback as State;

    if (secret) {
      const parsedValue = cookieStorage.unsign(value, secret);
      if (parsedValue) return parse(parsedValue);
    }

    return parse(value);
  }

  const setCookieStorageState = (
    value?: State,
    options: CookieOptions = {}
  ) => {
    if (value === undefined) return cookieStorage.removeItem(key);

    const previousOptions = retrieveCookieOptions(key);
    const mergedOptions = shallowMerge(previousOptions, options);
    const serializedValue = stringify(value);

    if (secret) {
      const hashedCookieData = cookieStorage.sign(serializedValue, secret);
      cookieStorage.setItem(key, hashedCookieData, mergedOptions);
    } else cookieStorage.setItem(key, serializedValue, mergedOptions);

    cookieOptionsMap.set(key, mergedOptions);
  };

  return [getCookieStorageState, setCookieStorageState];
}
