import type { WordMappingSegments } from "./word-mapping-segments";

export interface GenerateCookieKeyOptions<CookieDescription extends string> {
  /**
   * A descriptive phrase used to generate the cookie key fragments.
   * Typically includes words that should be shortened.
   *
   * @example "Verification Signature"
   */
  cookieDescription: CookieDescription;

  /**
   * A list of numbers indicating how many letters to extract from each word.
   *
   * @example [2, 3]
   */
  wordLengths?: WordMappingSegments<CookieDescription> | number[];

  /**
   * A prefix to add to the generated cookie key.
   *
   * @default "__"
   */
  cookieKeyPrefix?: string;

  /**
   * The designated scope of the cookie (e.g., "app", "secure").
   *
   * @default "app"
   */
  cookieKeyScope?: string;

  /**
   * Defines the case convention for the scope.
   * Accepts "title", "lower", or "upper".
   *
   * @default "lower"
   */
  scopeCase?: "title" | "lower" | "upper";

  /**
   * Character(s) used to join the scope and the fragments.
   *
   * @default "_"
   */
  scopeConnector?: string;

  /**
   * Character(s) used to join the word fragments.
   *
   * @default ""
   */
  fragmentSeparator?: string;
}
