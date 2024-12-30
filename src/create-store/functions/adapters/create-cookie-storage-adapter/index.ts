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
  stringify = safeStringify,
  parse = tryParse,
  signed = false,
  secret,
}: CookieStorageAdapter<State>): [
  getCookieStorageState: GetCookieStorage<State>,
  setCookieStorageState: SetCookieStorage<State>
] {
  if (signed && !secret) {
    throw new Error(`A secret must be provided to sign the cookie: "${key}".`);
  }

  const cookieOptionsMap = new Map<string, CookieOptions>();
  const defaultCookieOptions: CookieOptions = {
    path: "/",
    secure: false,
    partitioned: false,
    sameSite: "Lax",
    expires: 0,
  };

  const retrieveCookieOptions = (key: string): CookieOptions => {
    const options = cookieOptionsMap.get(key);
    if (options) return options;
    else return defaultCookieOptions;
  };

  function getCookieStorageState(): State | undefined;
  function getCookieStorageState(fallback: State): State;

  function getCookieStorageState(fallback?: State) {
    if (typeof cookieStorage === "undefined") return fallback;

    const value = cookieStorage.getItem(key);
    if (!value) return <State>fallback;

    if (signed) {
      if (!secret) {
        throw new Error(
          `A secret must be provided to sign the cookie: "${key}".`
        );
      }

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

    if (signed) {
      if (!secret) {
        throw new Error(
          `A secret must be provided to sign the cookie: "${key}".`
        );
      }

      const hashedCookieData = cookieStorage.sign(serializedValue, secret);
      cookieStorage.setItem(key, hashedCookieData, mergedOptions);
    }

    cookieOptionsMap.set(key, mergedOptions);
  };

  return [getCookieStorageState, setCookieStorageState];
}
