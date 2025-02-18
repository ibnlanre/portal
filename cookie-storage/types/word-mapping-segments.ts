export type WordMappingSegments<CookieDescription extends string> =
  CookieDescription extends `${string} ${infer Tail}`
    ? [number, ...WordMappingSegments<Tail>]
    : [number];
