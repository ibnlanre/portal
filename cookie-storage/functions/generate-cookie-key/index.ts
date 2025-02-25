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
 * // __Secure-auth_vr-sgt
 *
 * generateCookieKey({
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
export function generateCookieKey<CookieFragmentDescription extends string>({
  cookieFragmentDescription,
  cookiePrefix = "__",
  cookieFragmentSizes = [],
  cookieScope = "host",
  cookieScopeCase = "title",
  cookieService = "",
  cookieScopeServiceConnector = "-",
  cookieScopeFragmentConnector = "_",
  cookieFragmentsConnector = "",
  cookieSuffix = "",
}: GenerateCookieKeyOptions<CookieFragmentDescription>): string {
  const words = cookieFragmentDescription.toLowerCase().split(" ");

  if (cookieFragmentSizes.some((size) => size < 1)) {
    throw new Error("All chunk sizes must be at least 1.");
  }

  const fragments = words.map((word, index) => {
    const length = cookieFragmentSizes[index] || 1;
    return createCustomWordPattern(word, length);
  });

  cookieScope = transformCase(cookieScope, cookieScopeCase);

  const scope = join([cookiePrefix, cookieScope], "");
  const service = join([scope, cookieService], cookieScopeServiceConnector);
  const description = join(fragments, cookieFragmentsConnector);
  const name = join([service, description], cookieScopeFragmentConnector);

  return [name, cookieSuffix].join("");
}

function transformCase(
  text: string,
  caseType: "title" | "lower" | "upper" | "camel" | "pascal"
): string {
  switch (caseType) {
    case "title":
      return text.replace(/\b\w/g, (char) => char.toUpperCase());
    case "upper":
      return text.toUpperCase();
    case "camel":
      return text.replace(
        /([-_ ]\w)/g,
        (match) => match?.at(1)?.toUpperCase() ?? ""
      );
    case "pascal":
      return text.replace(/(^\w|[-_ ]\w)/g, (match) => match.toUpperCase());
    default:
      return text.toLowerCase();
  }
}

function join(segments: string[], connector: string): string {
  return segments.filter(Boolean).join(connector);
}
