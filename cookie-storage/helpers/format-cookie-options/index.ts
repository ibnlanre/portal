import type { CookieOptions } from "@/cookie-storage/types/cookie-options";

import { isEnabled } from "@/cookie-storage/helpers/is-enabled";

/**
 * Formats the provided cookie options into a string format compatible with the document.cookie API.
 *
 * @param {CookieOptions} [options] The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
export function formatCookieOptions({
  path = "/",
  ...options
}: CookieOptions = {}): string {
  let cookieOptions = `; path=${path}`;

  const { domain, secure, httpOnly, sameSite, maxAge, partitioned, expires } = {
    ...options,
  };

  if (isEnabled(domain)) cookieOptions += `; domain=${domain}`;
  if (isEnabled(secure)) cookieOptions += "; secure";
  if (isEnabled(httpOnly)) cookieOptions += "; httpOnly";
  if (isEnabled(expires)) {
    const expiresDate = new Date(expires).toUTCString();
    cookieOptions += `; expires=${expiresDate}`;
  }
  if (isEnabled(sameSite)) cookieOptions += `; SameSite=${sameSite}`;
  if (isEnabled(maxAge)) cookieOptions += `; max-age=${maxAge}`;
  if (isEnabled(partitioned)) cookieOptions += "; partitioned";

  return cookieOptions;
}
