/**
 * Retrieves the value of a cookie by its name.
 *
 * @param {string} name The name of the cookie.
 * @returns {string | null} The value of the cookie, or null if the cookie is not found or if document is not defined.
 */
export function getCookieValue(name: string): string | null {
  try {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookieAtIndex = cookies.at(i);
      if (!cookieAtIndex) continue;

      const cookie = cookieAtIndex.trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
  } catch (error) {
    console.error("Error retrieving Document Cookie", error);
  }

  return null;
}
