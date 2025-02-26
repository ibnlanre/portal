import type { CookieOptions } from "./cookie-options";
import type { CreateCookieKeyOptions } from "./create-cookie-key-options";

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
   *
   * @example
   *
   * ```ts
   * cookieStorage.sign("unsignedValue", process.env.SECRET); // "signedValue"
   * ```
   */
  sign: (value: string, secret: string) => string;

  /**
   * Unsign a signed cookie.
   *
   * @param signedCookie The signed cookie to unsign.
   * @param secret The secret to use for unsigning.
   *
   * @returns The unsigned cookie or null if the signed cookie is invalid.
   *
   * @example
   *
   * ```ts
   * cookieStorage.unsign("signedValue", process.env.SECRET); // "unsignedValue"
   * ```
   */
  unsign: (signedCookie: string, secret: string) => string | null;

  /**
   * Retrieves the value of the cookie with the specified name from the document.cookie.
   *
   * @param {string} name The name of the cookie.
   * @returns {string|null} The value of the cookie, or null if the cookie is not found.
   *
   * @example
   *
   * ```ts
   * cookieStorage.getItem("cookie1"); // "value1"
   * ```
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
   *
   * @example
   *
   * ```ts
   * cookieStorage.setItem("cookie1", "value1", { path: "/" });
   * ```
   */
  setItem: (name: string, value: string, options?: CookieOptions) => void;

  /**
   * Removes a cookie with the specified name.
   *
   * @param {string} name The name of the cookie to be removed.
   * @param {string} [path] The path of the cookie to be removed.
   *
   * @returns {void}
   *
   * @example
   *
   * ```ts
   * cookieStorage.removeItem("cookie1");
   * ```
   */
  removeItem: (name: string, path?: string) => void;

  /**
   * Clears all cookies from cookieStorage.
   *
   * @returns {void}
   *
   * @example
   *
   * ```ts
   * cookieStorage.clear();
   * ```
   */
  clear: () => void;

  /**
   * Generate a cookie key based on the provided options.
   *
   * @param {CreateCookieKeyOptions} options The options to use when generating the cookie key.
   * @returns {string} The generated cookie key.
   *
   * @example
   *
   * ```ts
   * // __Secure-auth_vr-sgt
   *
   * cookieStorage.makeKey({
   *  cookieFragmentDescription: "Verification Signature",
   *  cookiePrefix: "__",
   *  cookieFragmentSizes: [2, 3],
   *  cookieScope: "secure",
   *  cookieScopeCase: "title",
   *  cookieService: "auth",
   *  cookieScopeServiceConnector: "-",
   *  cookieScopeFragmentConnector: "_",
   *  cookieFragmentsConnector: "-",
   *  cookieSuffix: "",
   * });
   */
  makeKey: <CookieFragmentDescription extends string>(
    options: CreateCookieKeyOptions<CookieFragmentDescription>
  ) => string;

  /**
   * Get a cookie by index from cookieStorage.
   *
   * @param {number} index The index of the cookie to retrieve.
   * @returns {string | null} The cookie value if found, or null if not found.
   *
   * @example
   *
   * ```ts
   * cookieStorage.key; // "cookie1"
   * ```
   */
  key: (index: number) => string | null;

  /**
   * Get the length of cookieStorage (the number of individual cookies).
   *
   * @returns {number} The number of cookies in cookieStorage.
   *
   * @example
   *
   * ```ts
   * cookieStorage.length; // 3
   * ```
   */
  length: number;
}
