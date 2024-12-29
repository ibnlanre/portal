import type { CookieOptions } from "@/cookie-storage/types/cookie-options";

import { formatCookieOptions } from "@/cookie-storage/functions/format-cookie-options";

/**
 * Sets a cookie with the specified name and value.
 *
 * @param {string} name The name of the cookie.
 * @param {string} value The value to be set for the cookie.
 * @param {CookieOptions} [options] Optional cookie options.
 *
 * @returns {void}
 */
export function setCookieValue(
  name: string,
  value: string,
  options?: CookieOptions
) {
  try {
    if (typeof document === "undefined") return;

    const cookieOptionsString = formatCookieOptions(options);
    document.cookie = `${name}=${value}${cookieOptionsString}`;
  } catch (error) {
    console.error("Error occurred while setting cookie:", error);
  }
}
