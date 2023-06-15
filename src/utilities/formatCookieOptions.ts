export type CookieOptions = {
  path?: string;
  domain?: string;
  expires?: number | Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

/**
 * Formats the provided cookie options into a string format compatible with the document.cookie API.
 * @param {CookieOptions} [options] - The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
export function formatCookieOptions(options?: CookieOptions): string {
  if (!options) return "";

  const {
    path = "",
    domain = "",
    expires = "",
    secure = false,
    sameSite = "",
  } = options;

  let optionsString = "";
  if (path) optionsString += `;path=${path}`;
  if (domain) optionsString += `;domain=${domain}`;
  if (expires) {
    const expiresDate = new Date(expires);
    optionsString += `;expires=${expiresDate.toUTCString()}`;
  }
  if (secure) optionsString += ";secure";
  if (sameSite) optionsString += `;samesite=${sameSite}`;

  return optionsString;
}
