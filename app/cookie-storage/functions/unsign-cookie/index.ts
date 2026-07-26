import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { constantTimeCompare } from "@/cookie-storage/helpers/constant-time-compare";

/**
 * Unsign a signed cookie.
 *
 * @param signedCookie The signed cookie to unsign.
 * @param secret The secret to use for unsigning.
 *
 * @returns The unsigned cookie or null if the signed cookie is invalid.
 */
export function unsignCookie(
  signedCookie: string,
  secret: string
): null | string {
  try {
    const demarcator = signedCookie.lastIndexOf(".");
    if (demarcator === -1) return null;

    const cookie = signedCookie.slice(0, demarcator);
    const expectedSignature = signCookie(cookie, secret);

    if (constantTimeCompare(expectedSignature, signedCookie)) {
      return cookie;
    }
  } catch (error) {
    console.error("Error occurred while unsigning cookie:", error);
  }

  return null;
}
