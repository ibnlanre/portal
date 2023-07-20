/**
 * Clears all cookies from cookieStorage.
 * @returns {void}
 */
export function clearCookieStorage() {
  try {
    if (typeof document === "undefined") return;

    const cookies = document.cookie.split(";");

    // Removing each cookie by setting its expiration date to the past
    cookies.forEach((cookie) => {
      const [name, _] = cookie.split("=");
      // Some browsers will not let us delete a cookie if we don't specify the path.
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
  } catch (error) {
    console.error("Error occurred while clearing cookieStorage:", error);
  }
}
