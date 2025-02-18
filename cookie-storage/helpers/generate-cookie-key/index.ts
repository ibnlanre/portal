import { createCustomWordPattern } from "@/cookie-storage/helpers/create-custom-word-pattern";
import type { GenerateCookieKeyOptions } from "@/cookie-storage/types/generate-cookie-key-options";

/**
 * Generates a cookie key based on the provided options.
 *
 * @param options The options to use when generating the cookie key.
 * @returns The generated cookie key.
 *
 * @example
 *
 * ```ts
 * generateCookieKey({
 *  cookieDescription: "Verification Signature",
 *  cookieFragmentSizes: [2, 3],
 *  cookieKeyPrefix: "__",
 *  cookieKeyScope: "secure",
 *  scopeCase: "title",
 *  scopeFragmentConnector: "_",
 *  fragmentSeparator: "-",
 *  cookieKeySuffix: "",
 * }); // __Secure_vr-sgt
 */
export function generateCookieKey<CookieDescription extends string>({
  cookieDescription,
  cookieKeyPrefix = "__",
  cookieFragmentSizes = [],
  cookieKeyScope = "app",
  scopeCase = "lower",
  scopeFragmentConnector = "_",
  fragmentSeparator = "",
  cookieKeySuffix = "",
}: GenerateCookieKeyOptions<CookieDescription>): string {
  const words = cookieDescription.toLowerCase().split(" ");

  const fragments = words.map((word, index) => {
    const length = cookieFragmentSizes[index] || 1;
    return createCustomWordPattern(word, length);
  });

  if (scopeCase === "title") {
    cookieKeyScope = cookieKeyScope.replace(/\b\w/g, (char) => {
      return char.toUpperCase();
    });
  } else if (scopeCase === "upper") {
    cookieKeyScope = cookieKeyScope.toUpperCase();
  } else cookieKeyScope = cookieKeyScope.toLowerCase();

  return [
    [
      [cookieKeyPrefix, cookieKeyScope].join(""),
      fragments.join(fragmentSeparator),
    ].join(scopeFragmentConnector),
    cookieKeySuffix,
  ].join("");
}
