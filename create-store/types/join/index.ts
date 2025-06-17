export type Join<
  Components extends string[],
  Delimiter extends string = ".",
> = Components extends [infer Head, ...infer Tail]
  ? Head extends string
    ? Tail extends string[]
      ? Head extends ""
        ? Join<Tail, Delimiter>
        : Tail extends []
          ? Head
          : `${Head}${Delimiter}${Join<Tail, Delimiter>}`
      : never
    : never
  : "";
