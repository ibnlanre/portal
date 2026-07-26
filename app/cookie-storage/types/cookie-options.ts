/**
 * Represents the options for setting a cookie.
 */
export type CookieOptions = {
  /**
   * The domain for which the cookie is valid.
   */
  domain?: string;

  /**
   * The expiration date or duration for the cookie.
   * It can be a number representing the number of seconds until expiration,
   * or a Date object specifying the exact expiration date and time.
   */
  expires?: Date | number;

  /**
   * Specifies if the cookie should be accessible only through HTTP requests and not through JavaScript code.
   */
  httpOnly?: boolean;

  /**
   * The maximum age of the cookie in seconds.
   */
  maxAge?: number;

  /**
   * Specifies if the cookie should be partitioned.
   */
  partitioned?: boolean;

  /**
   * The path for which the cookie is valid.
   */
  path?: string;

  /**
   * Specifies the SameSite attribute for the cookie.
   * It can be one of the following values: "Strict", "Lax", or "None".
   */
  sameSite?: "Lax" | "None" | "Strict";

  /**
   * Specifies if the cookie should only be transmitted over secure (HTTPS) connections.
   */
  secure?: boolean;
};
