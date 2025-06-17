import type { CookieStorage } from "@/cookie-storage/types/cookie-storage";

import { clearCookieStorage } from "@/cookie-storage/functions/clear-cookie-storage";
import { createCookieKey } from "@/cookie-storage/functions/create-cookie-key";
import { getCookieByIndex } from "@/cookie-storage/functions/get-cookie-by-index";
import { getCookieStorageLength } from "@/cookie-storage/functions/get-cookie-storage-length";
import { getCookieValue } from "@/cookie-storage/functions/get-cookie-value";
import { removeCookieValue } from "@/cookie-storage/functions/remove-cookie-value";
import { setCookieValue } from "@/cookie-storage/functions/set-cookie-value";
import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { unsignCookie } from "@/cookie-storage/functions/unsign-cookie";

/**
 * An object representing a cookie storage with various methods to interact with cookies.
 */
export const cookieStorage = {
  clear: clearCookieStorage,
  createKey: createCookieKey,
  getItem: getCookieValue,
  key: getCookieByIndex,
  get length() {
    return getCookieStorageLength();
  },
  removeItem: removeCookieValue,
  setItem: setCookieValue,
  sign: signCookie,
  unsign: unsignCookie,
} as CookieStorage;
