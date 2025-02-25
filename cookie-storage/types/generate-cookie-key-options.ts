import type { WordMappingSegments } from "./word-mapping-segments";

export interface GenerateCookieKeyOptions<
  CookieFragmentDescription extends string
> {
  /**
   * A descriptive phrase used to generate one or more fragments for the cookie key.
   * Often includes words to be shortened.
   *
   * @example "Verification Signature"
   */
  cookieFragmentDescription: CookieFragmentDescription;

  /**
   * Array of numbers specifying how many letters to extract from each word in the description.
   * Defaults to extracting only one letter for each word if not provided.
   *
   * @example [2, 3]
   */
  cookieFragmentSizes?:
    | WordMappingSegments<CookieFragmentDescription>
    | number[];

  /**
   * Prefix added to the generated cookie key, e.g. for internal or system cookies.
   *
   * By convention, the prefix is usually one or two underscores.
   * The prefix is used to differentiate between regular and special cookies.
   *
   * @see {@link https://check-your-website.server-daten.de/prefix-cookies.html Why should you only use Prefix - Cookies?}
   *
   * @description
   *
   * - `""` (empty string) indicates no prefix.
   * - `"_"` is a common prefix for internal purposes (such as tracking user sessions).
   * - `"__"` is a common prefix for system-level operations (such as storing user preferences).
   *
   * @default "__"
   */
  cookiePrefix?: "" | "_" | "__" | (string & {});

  /**
   * Logical scope indicating cookie usage context such as "host" or "secure".
   * Helps in classifying cookies based on their function.
   *
   * @default "host"
   */
  cookieScope?:
    | ""
    | "app"
    | "global"
    | "host"
    | "secure"
    | "session"
    | "user"
    | (string & {});

  /**
   * Identifies the service or subsystem setting the cookie, like "auth" or "data".
   *
   * @default ""
   */
  cookieService?:
    | ""
    | "auth"
    | "cache"
    | "config"
    | "data"
    | "log"
    | "store"
    | (string & {});

  /**
   * Specifies the casing format applied to the cookie scope.
   *
   * @default "title"
   */
  cookieScopeCase?: "title" | "lower" | "upper" | "camel" | "pascal";

  /**
   * Character(s) used to connect the scope and service strings, enhancing readability.
   *
   * @default "_"
   */
  cookieScopeServiceConnector?: "-" | "_" | (string & {});

  /**
   * Symbol that separates the scope from the fragments in the final cookie key.
   *
   * @default "_"
   */
  cookieScopeFragmentConnector?: "_" | "-" | "." | (string & {});

  /**
   * Character(s) used to join the extracted word fragments.
   *
   * @default ""
   */
  cookieFragmentsConnector?: "" | "_" | "-" | "." | (string & {});

  /**
   * A suffix appended at the end of the cookie key, if required for differentiation.
   *
   * @default ""
   */
  cookieSuffix?: "" | "_" | "__" | (string & {});
}
