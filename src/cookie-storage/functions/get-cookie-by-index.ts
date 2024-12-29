/**
 * Get a cookie by index from cookieStorage.
 * @param {number} index The index of the cookie to retrieve.
 * @returns {string | null} The cookie value if found, or null if not found.
 */
export function getCookieByIndex(index: number): string | null {
  try {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const cookie = cookies[index];

    if (cookie) {
      const [name = null] = cookie.trim().split("=");
      return name;
    }

    return null;
  } catch (error) {
    console.error("Error occurred while getting cookie by index:", error);
    return null;
  }
}
