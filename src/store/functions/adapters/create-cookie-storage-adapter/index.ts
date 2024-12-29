import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import type { Initializer } from "@/store/types/initializer";
import type { Subscriber } from "@/store/types/subscriber";

import { cookieStorage } from "@/cookie-storage";
import { shallowMerge } from "@/store/functions/helpers/shallow-merge";
import { reportException } from "@/store/functions/utilities/report-exeption";

export function createCookieStorageAdapter<State>(
  key: string,
  fallback?: State
): [
  getCookieStorageState: Initializer<State>,
  setCookieStorageState: Subscriber<State>
] {
  const cookieOptionsMap = new Map<string, CookieOptions>();

  const retrieveCookieOptions = (key: string): CookieOptions => {
    const options = cookieOptionsMap.get(key);
    if (options) return options;
    return {};
  };

  const getCookieStorageState = (): State => {
    const value = cookieStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (exception) {
        reportException({
          message: "Failed to parse stored value from cookieStorage:",
          exception,
          key,
          value,
        });
      }
    }
    return <State>fallback;
  };

  const setCookieStorageState = (value: State, options: CookieOptions = {}) => {
    const previousOptions = retrieveCookieOptions(key);
    const mergedOptions = shallowMerge(previousOptions, options);

    try {
      cookieStorage.setItem(key, JSON.stringify(value), mergedOptions);
      cookieOptionsMap.set(key, mergedOptions);
    } catch (exception) {
      reportException({
        message: "Failed to store value in cookieStorage:",
        exception,
        key,
        value,
      });
    }
  };

  return [getCookieStorageState, setCookieStorageState];
}
