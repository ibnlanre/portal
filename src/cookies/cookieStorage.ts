import { CookieStorage } from "@/definition";

import { clearCookieStorage } from "./clearCookieStorage";
import { getCookieByIndex } from "./getCookieByIndex";
import { getCookieStorageLength } from "./getCookieStorageLength";
import { getCookieValue } from "./getCookieValue";
import { removeCookieValue } from "./removeCookieValue";
import { setCookieValue } from "./setCookieValue";

/**
 * An object representing a cookie storage with various methods to interact with cookies.
 */
export const cookieStorage: CookieStorage = {
  /**
   * Retrieves the value of the cookie with the specified name from the document.cookie.
   *
   * @param {string} name The name of the cookie.
   * @returns {string|null} The value of the cookie, or null if the cookie is not found.
   */
  getItem: getCookieValue,

  /**
   * Sets a cookie with the specified name and value.
   *
   * @param {string} name The name of the cookie.
   * @param {string} value The value to be set for the cookie.
   * @param {CookieOptions} [options] Optional cookie options.
   * @returns {void}
   */
  setItem: setCookieValue,

  /**
   * Removes a cookie with the specified name.
   *
   * @param {string} name The name of the cookie to be removed.
   * @param {string} [path] The path of the cookie to be removed.
   * @returns {void}
   */
  removeItem: removeCookieValue,

  /**
   * Clears all cookies from cookieStorage.
   * @returns {void}
   */
  clear: clearCookieStorage,

  /**
   * Get the length of cookieStorage (the number of individual cookies).
   * @returns {number} The number of cookies in cookieStorage.
   */
  get length() {
    return getCookieStorageLength();
  },

  /**
   * Get a cookie by index from cookieStorage.
   * @param {number} index The index of the cookie to retrieve.
   * @returns {string | null} The cookie value if found, or null if not found.
   */
  key: getCookieByIndex,
};