import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import type {
  CookieStorageAdapter,
  GetCookieStorage,
  SetCookieStorage,
} from "@/create-store/types/cookie-storage";

import { cookieStorage } from "@/cookie-storage";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";
import { safeStringify } from "@/create-store/functions/utilities/safe-stringify";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function createCookieStorageAdapter<State>({
  key,
  parse = tryParse,
  stringify = safeStringify,
  signed = false,
  secret,
  ...cookieOptions
}: CookieStorageAdapter<State>): [
  getCookieStorageState: GetCookieStorage<State>,
  setCookieStorageState: SetCookieStorage<State>
] {
  const hasSecret = typeof secret !== "undefined";

  if (signed && !hasSecret) {
    throw new Error(`A secret must be provided to sign the cookie: "${key}".`);
  }

  const cookieOptionsMap = new Map<string, CookieOptions>();

  const retrieveCookieOptions = (key: string): CookieOptions => {
    const options = cookieOptionsMap.get(key);
    if (options) return options;
    return cookieOptions;
  };

  function getCookieStorageState(): State | undefined;
  function getCookieStorageState(fallback: State): State;

  function getCookieStorageState(fallback?: State) {
    if (typeof cookieStorage === "undefined") return fallback;

    const value = cookieStorage.getItem(key);
    if (!value) return <State>fallback;

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
    if (typeof cookieStorage === "undefined") return;
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
