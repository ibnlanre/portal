/**
 * Get a cookie by index from cookieStorage.
 *
 * @param {number} index The index of the cookie to retrieve.
 * @returns {string | null} The cookie value if found, or null if not found.
 */
export function getCookieByIndex(index: number): string | null {
  try {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const cookie = cookies[index];

    if (cookie) {
      const [name] = cookie.split("=");
      if (name) return name.trim();
    }
  } catch (error) {
    console.error("Error occurred while getting cookie by index:", error);
  }

  return null;
}
