import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import type { StorageAdapterOptions } from "@/create-store/types/storage-adapter";

type CookieSignature =
  | {
      signed?: never;
      secret?: never;
    }
  | {
      signed?: false;
      secret?: string;
    }
  | {
      /**
       * Specifies if the cookie is designed for use by a single application.
       *
       * @throws An error if `signed` is true and `secret` is undefined.
       */
      signed: true;

      /**
       * The secret to use for signing the cookie.
       *
       * @throws An error if `signed` is true and `secret` is undefined.
       */
      secret: string | undefined;
    };

interface CookieDataOptions<State>
  extends StorageAdapterOptions<State>,
    CookieOptions {}

export type CookieStorageAdapterOptions<State> = CookieDataOptions<State> &
  CookieSignature;

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
