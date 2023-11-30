/**
 * Represents the options for setting a cookie.
 */
export type CookieOptions = {
  /**
   * The path for which the cookie is valid.
   */
  path?: string;

  /**
   * The domain for which the cookie is valid.
   */
  domain?: string;

  /**
   * The expiration date or duration for the cookie.
   * It can be a number representing the number of seconds until expiration,
   * or a Date object specifying the exact expiration date and time.
   */
  expires?: number | Date;

  /**
   * Specifies if the cookie should only be transmitted over secure (HTTPS) connections.
   */
  secure?: boolean;

  /**
   * Specifies the SameSite attribute for the cookie.
   * It can be one of the following values: "strict", "lax", or "none".
   */
  sameSite?: "strict" | "lax" | "none";

  /**
   * The maximum age of the cookie in seconds.
   */
  maxAge?: number;

  /**
   * Specifies if the cookie should be accessible only through HTTP requests and not through JavaScript code.
   */
  httpOnly?: boolean;

  /**
   * Specifies if the cookie should be partitioned.
   */
  partitioned?: boolean;
};

/**
 * Represents a cookie entry in the cookie storage.
 */
export type CookieEntry = CookieOptions & {
  /**
   * The value of the cookie entry, which is of type `string`.
   */
  value: string;
};

/**
 * Represents the cookie storage.
 */
export interface CookieStorage extends Storage {
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
   * @returns {void}
   */
  setItem: (name: string, value: string, options?: CookieOptions) => void;

  /**
   * Removes a cookie with the specified name.
   *
   * @param {string} name The name of the cookie to be removed.
   * @param {string} [path] The path of the cookie to be removed.
   * @returns {void}
   */
  removeItem: (name: string, path?: string) => void;

  /**
   * Clears all cookies from cookieStorage.
   * @returns {void}
   */
  clear: () => void;

  /**
   * Get the length of cookieStorage (the number of individual cookies).
   * @returns {number} The number of cookies in cookieStorage.
   */
  length: number;

  /**
   * Get a cookie by index from cookieStorage.
   * @param {number} index The index of the cookie to retrieve.
   * @returns {string | null} The cookie value if found, or null if not found.
   */
  key: (index: number) => string | null;
}
