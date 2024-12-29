import { setCookieValue } from "@/cookie-storage/functions/set-cookie-value";

/**
 * Removes a cookie with the specified name.
 *
 * @param {string} name The name of the cookie to be removed.
 * @param {string} [path] Optional path of the cookie to be removed.
 *
 * @returns {void}
 */
export function removeCookieValue(name: string, path: string = "/") {
  try {
    if (typeof document === "undefined") return;

    const expires = new Date(0);
    setCookieValue(name, "", { expires, path });
  } catch (error) {
    console.error(
      `Error occurred while removing ${name} from document.cookie`,
      error
    );
  }
}
