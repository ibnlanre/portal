import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import type {
  CookieStorageAdapterOptions,
  GetCookieStorage,
  SetCookieStorage,
} from "@/create-store/types/cookie-storage";

import { cookieStorage } from "@/cookie-storage";
import { isNullish } from "@/create-store/functions/assertions/is-nullish";
import {
  readPersisted,
  writePersisted,
} from "@/create-store/functions/helpers/persisted-format";
import { tryParse } from "@/create-store/functions/utilities/try-parse";

export function cookieAdapter<State>(
  key: string,
  {
    migrate,
    parse = tryParse,
    secret,
    signed = false,
    stringify = JSON.stringify,
    validate,
    version,
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
    if (isNullish(value)) return fallback as State;

    if (secret) {
      const parsedValue = cookieStorage.unsign(value, secret);
      if (parsedValue === null) return fallback;
      else {
        const persisted = readPersisted(parse(parsedValue), {
          migrate,
          validate,
          version,
        });
        return persisted ?? fallback;
      }
    }

    return (
      readPersisted(parse(value), { migrate, validate, version }) ?? fallback
    );
  }

  const setCookieStorageState = (
    value?: State,
    options: CookieOptions = {}
  ) => {
    if (value === undefined) return cookieStorage.removeItem(key);

    const previousOptions = retrieveCookieOptions(key);
    const mergedOptions = { ...previousOptions, ...options };
    const serializedValue = stringify(writePersisted(value, version) as State);

    if (secret) {
      const hashedCookieData = cookieStorage.sign(serializedValue, secret);
      cookieStorage.setItem(key, hashedCookieData, mergedOptions);
    } else cookieStorage.setItem(key, serializedValue, mergedOptions);

    cookieOptionsMap.set(key, mergedOptions);
  };

  return [getCookieStorageState, setCookieStorageState];
}
