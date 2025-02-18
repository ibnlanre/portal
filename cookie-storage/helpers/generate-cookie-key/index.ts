import { createCustomWordPattern } from "@/cookie-storage/helpers/create-custom-word-pattern";
import type { GenerateCookieKeyOptions } from "@/cookie-storage/types/generate-cookie-key-options";

export function generateCookieKey<CookieDescription extends string>({
  cookieDescription,
  wordLengths = [],
  cookieKeyPrefix = "__",
  cookieKeyScope = "app",
  scopeCase = "lower",
  scopeConnector = "_",
  fragmentSeparator = "",
}: GenerateCookieKeyOptions<CookieDescription>): string {
  const words = cookieDescription.toLowerCase().split(" ");

  const fragments = words.map((word, index) => {
    const length = wordLengths[index] || 1;
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
    [cookieKeyPrefix, cookieKeyScope].join(""),
    fragments.join(fragmentSeparator),
  ].join(scopeConnector);
}
