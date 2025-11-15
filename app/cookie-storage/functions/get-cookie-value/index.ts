/**
 * Retrieves the value of a cookie by its name.
 *
 * @param {string} name The name of the cookie.
 * @returns {string | null} The value of the cookie, or null if the cookie is not found or if document is not defined.
 */
export function getCookieValue(name: string): null | string {
  try {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");

    for (let index = 0; index < cookies.length; index++) {
      const cookieAtIndex = cookies.at(index);
      if (!cookieAtIndex) continue;

      const cookie = cookieAtIndex.trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
  } catch (error) {
    console.error("Error occurred while retrieving cookie:", error);
  }

  return null;
}
