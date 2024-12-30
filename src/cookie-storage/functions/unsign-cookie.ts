import { signCookie } from "@/cookie-storage/functions/sign-cookie";

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
): string | null {
  const demarcator = signedCookie.lastIndexOf(".");
  if (demarcator === -1) return null;

  const cookie = signedCookie.slice(0, demarcator);
  const expectedSignature = signCookie(cookie, secret);

  const expectedInput = Buffer.from(expectedSignature);
  const input = Buffer.from(signedCookie);

  if (expectedInput.length !== input.length) return null;
  return expectedInput.equals(input) ? cookie : null;
}
