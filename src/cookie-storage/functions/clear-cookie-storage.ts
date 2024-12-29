import { removeCookieValue } from "@/cookie-storage/functions/remove-cookie-value";

/**
 * Clears all cookies from cookieStorage.
 * @returns {void}
 */
export function clearCookieStorage() {
  try {
    if (typeof document === "undefined") return;

    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const [name] = cookie.split("=");
      if (name) removeCookieValue(name);
    });
  } catch (error) {
    console.error("Error occurred while clearing cookieStorage:", error);
  }
}
