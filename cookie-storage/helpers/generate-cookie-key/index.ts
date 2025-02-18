import { createCustomWordPattern } from "../create-custom-word-pattern";

type Segments<T> = T extends `${string} ${infer Tail}`
  ? [number, ...Segments<Tail>]
  : [number];

interface GenerateCookieKey<Description extends string> {
  description: Description;
  mapping: Segments<Description> | (number & {})[];
  prefix?: "" | "_" | "__" | (string & {});
  scope?: "" | "app" | "host" | "secure" | "session" | (string & {});
  coupler?: "_" | "-" | (string & {});
  separator?: "" | "_" | "-" | "." | (string & {});
}

export function generateCookieKey<Description extends string>({
  description,
  mapping = [],
  prefix = "__",
  scope = "app",
  coupler = "_",
  separator = "",
}: GenerateCookieKey<Description>): string {
  const words = description.toLowerCase().split(" ");

  const fragments = words.map((word, index) => {
    const length = mapping[index] || 1;
    return createCustomWordPattern(word, length);
  });

  return [[prefix, scope].join(""), fragments.join(separator)].join(coupler);
}
