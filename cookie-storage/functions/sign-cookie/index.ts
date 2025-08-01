import { createHmac } from "@/cookie-storage/helpers/create-hmac";

/**
 * Sign a cookie with a secret.
 *
 * @param cookie The cookie to sign.
 * @param secret The secret to sign the cookie with.
 *
 * @returns The signed cookie.
 */
export function signCookie(cookie: string, secret?: string): string {
  if (!secret) return cookie;

  try {
    const signature = createHmac("sha256", secret)
      .update(cookie)
      .digest("base64")
      .replace(/=+$/, "");

    return [cookie, signature].join(".");
  } catch (error) {
    console.error("Error occurred while signing cookie:", error);
  }

  return cookie;
}
