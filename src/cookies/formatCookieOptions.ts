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
 * Formats the provided cookie options into a string format compatible with the document.cookie API.
 *
 * @param {CookieOptions} [options] The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
export function formatCookieOptions(options?: CookieOptions): string {
  if (!options) return "; path=/";

  let optionsString = `; path=${options.path ?? "/"}`;
  if (options.domain) optionsString += `; domain=${options.domain}`;
  if (options.secure || options.httpOnly) optionsString += "; secure";
  if (options.expires) {
    const expires =
      options.expires instanceof Date
        ? options.expires.toUTCString()
        : options.expires;
    optionsString += `; expires=${expires}`;
  }
  if (options.sameSite) optionsString += `; samesite=${options.sameSite}`;
  if (options.maxAge) optionsString += `; max-age=${options.maxAge}`;
  if (options.httpOnly) optionsString += "; httpOnly";
  if (options.partitioned) optionsString += "; partitioned";

  return optionsString;
}
