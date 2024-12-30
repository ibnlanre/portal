import type { CookieOptions } from "@/cookie-storage/types/cookie-options";

export interface GetCookieStorage<State> {
  /**
   * Get the state from cookie storage.
   *
   * @returns The state from cookie storage or undefined.
   */
  (): State | undefined;

  /**
   * Get the state from cookie storage or return a fallback state.
   *
   * @param fallback The fallback state to return if the state is not found in cookie storage.
   * @returns The state from cookie storage or the fallback state.
   */
  (fallback: State): State;
}

/**
 * Set the state in cookie storage.
 *
 * @param value The state to set in cookie storage.
 * @param options The options to use when setting the cookie.
 */
export type SetCookieStorage<State> = (
  value?: State,
  options?: CookieOptions
) => void;

type CookieSignature =
  | {
      signed?: never;
      secret?: never;
    }
  | {
      /**
       * Specifies if the cookie is designed for use by a single application.
       *
       * @default false
       * @type {boolean}
       */
      signed: boolean;

      /**
       * The secret to use for signing the cookie.
       *
       * @throws An error if the secret is not provided.
       * @type {string | undefined}
       */
      secret: string | undefined;
    };

type CookieData<State> = {
  /**
   * A function to serialize the state to a string.
   *
   * @param value The state to serialize.
   * @default JSON.stringify
   *
   * @returns The serialized state.
   */
  stringify?: (value: State) => string;

  /**
   * A function to parse the state from a string.
   *
   * @param value The string to parse.
   * @default JSON.parse
   *
   * @returns The parsed state.
   */
  parse?: (value: string) => State;

  /**
   * The options to use when setting the cookie.
   *
   * @default
   * {
   *   path: "/",
   *   secure: false,
   *   partitioned: false,
   *   sameSite: "Lax",
   *   expires: 0,
   * }
   */
  options?: CookieOptions;
};

export type CookieStorageAdapter<State> = CookieData<State> & CookieSignature;
