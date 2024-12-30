import type { CookieOptions } from "./cookie-options";

/**
 * Represents the cookie storage.
 */
export interface CookieStorage extends Storage {
  /**
   * Sign a cookie value.
   *
   * @param {string} value The value to sign.
   * @param {string} secret The secret to use for signing.
   *
   * @returns {string} The signed value.
   */
  sign: (value: string, secret: string) => string;

  /**
   * Unsign a signed cookie.
   *
   * @param signedCookie The signed cookie to unsign.
   * @param secret The secret to use for unsigning.
   *
   * @returns The unsigned cookie or null if the signed cookie is invalid.
   */
  unsign: (signedCookie: string, secret: string) => string | null;

  /**
   * Retrieves the value of the cookie with the specified name from the document.cookie.
   *
   * @param {string} name The name of the cookie.
   * @returns {string|null} The value of the cookie, or null if the cookie is not found.
   */
  getItem: (name: string) => string | null;

  /**
   * Sets a cookie with the specified name and value.
   *
   * @param {string} name The name of the cookie.
   * @param {string} value The value to be set for the cookie.
   * @param {CookieOptions} [options] Optional cookie options.
   *
   * @returns {void}
   */
  setItem: (name: string, value: string, options?: CookieOptions) => void;

  /**
   * Removes a cookie with the specified name.
   *
   * @param {string} name The name of the cookie to be removed.
   * @param {string} [path] The path of the cookie to be removed.
   *
   * @returns {void}
   */
  removeItem: (name: string, path?: string) => void;

  /**
   * Clears all cookies from cookieStorage.
   * @returns {void}
   */
  clear: () => void;

  /**
   * Get a cookie by index from cookieStorage.
   * @param {number} index The index of the cookie to retrieve.
   * @returns {string | null} The cookie value if found, or null if not found.
   */
  key: (index: number) => string | null;

  /**
   * Get the length of cookieStorage (the number of individual cookies).
   * @returns {number} The number of cookies in cookieStorage.
   */
  length: number;
}
