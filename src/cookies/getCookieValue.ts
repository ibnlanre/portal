/**
 * Retrieves the value of a cookie by its name.
 *
 * @param {string} name The name of the cookie.
 * @returns {string | null} The value of the cookie, or null if the cookie is not found or if document is not defined.
 */
export function getCookieValue(name: string): string | null {
  try {
    if (typeof document === "undefined") return null;
    const cookies = document?.cookie?.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies?.at(i)?.trim();
      if (cookie?.startsWith(name + "=")) {
        return cookie?.substring(name.length + 1);
      }
    }
  } catch (error) {
    console.error("Error retrieving Document Cookie", error);
  }
  return null;
}

/**
 * Retrieves the value of a cookie with the specified name from the document.cookie using regex.
 *
 * @param {string} name The name of the cookie to retrieve.
 * @returns {string | null} The value of the cookie if found, or null if the cookie is not found or if document is not defined.
 */
export function getCookieValueByRegex(name: string): string | null {
  try {
    if (typeof document === "undefined") return null;
    const escapedName = name.replace(/([\W])/g, "$1"); // Escape special characters
    const pattern = new RegExp(`(?<=;?\s*${escapedName}\s*=\s*)([^\s;]+)`);
    const cookieValueMatch = document.cookie.match(pattern);

    if (Array.isArray(cookieValueMatch)) {
      return cookieValueMatch?.at(1) ?? null;
    }
  } catch (error) {
    console.error("Error retrieving Document Cookie", error);
  }
  return null;
}
