/**
 * Retrieves the value of the cookie with the specified name from the document.cookie.
 * 
 * @param {string} name The name of the cookie.
 * @returns {string|null} The value of the cookie, or null if the cookie is not found.
 */
export function getCookieValue(name: string) {
  try {
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
