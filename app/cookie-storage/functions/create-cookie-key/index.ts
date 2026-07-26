import type { CreateCookieKeyOptions } from "@/cookie-storage/types/create-cookie-key-options";

import { createCustomWordPattern } from "@/cookie-storage/helpers/create-custom-word-pattern";
import { join } from "@/cookie-storage/helpers/join";
import { transformCase } from "@/cookie-storage/helpers/transform-case";

/**
 * Creates a cookie key based on the provided options.
 *
 * @param options The options to use when generating the cookie key.
 * @returns The generated cookie key.
 *
 * @example
 *
 * ```ts
 * // __Secure-auth_vr-sgt
 *
 * createCookieKey({
 *  cookieFragmentDescription: "Verification Signature",
 *  cookiePrefix: "__",
 *  cookieFragmentSizes: [2, 3],
 *  cookieScope: "secure",
 *  cookieScopeCase: "title",
 *  cookieService: "auth",
 *  cookieScopeServiceConnector: "-",
 *  cookieScopeFragmentConnector: "_",
 *  cookieFragmentsConnector: "-",
 *  cookieSuffix: "",
 * });
 */
export function createCookieKey<CookieFragmentDescription extends string>({
  cookieFragmentDescription,
  cookieFragmentsConnector = "",
  cookieFragmentSizes = [],
  cookiePrefix = "",
  cookieScope = "",
  cookieScopeCase = "title",
  cookieScopeFragmentConnector = "_",
  cookieScopeServiceConnector = "-",
  cookieService = "",
  cookieSuffix = "",
}: CreateCookieKeyOptions<CookieFragmentDescription>): string {
  const words = cookieFragmentDescription.toLowerCase().split(" ");

  if (cookieFragmentSizes.length > words.length) {
    throw new Error(
      "The number of fragments must be less than or equal to the number of words"
    );
  }

  if (cookieFragmentSizes.some((size) => size < 0)) {
    throw new Error("Each fragment must be a positive number");
  }

  const fragments = words.map((word, index) => {
    const length = cookieFragmentSizes[index] ?? 1;
    return createCustomWordPattern(word, length);
  });

  cookieScope = transformCase(cookieScope, cookieScopeCase);

  const scope = join([cookiePrefix, cookieScope]);
  const service = join([scope, cookieService], cookieScopeServiceConnector);
  const description = join(fragments, cookieFragmentsConnector);
  const name = join([service, description], cookieScopeFragmentConnector);

  return join([name, cookieSuffix]);
}
