export type EscapeStoreKey<
  Key extends string,
  Delimiter extends string = ".",
> = string extends Key
  ? string
  : Key extends `${infer Head}${infer Tail}`
    ? `${Head extends "\\" | Delimiter ? "\\" : ""}${Head}${EscapeStoreKey<Tail, Delimiter>}`
    : "";

export type SplitStorePath<
  Path extends string,
  Delimiter extends string = ".",
  Current extends string = "",
  Parts extends string[] = [],
> = string extends Path
  ? [string]
  : Path extends `\\${infer Escaped}${infer Tail}`
    ? SplitStorePath<Tail, Delimiter, `${Current}${Escaped}`, Parts>
    : Path extends `${Delimiter}${infer Tail}`
      ? SplitStorePath<Tail, Delimiter, "", [...Parts, Current]>
      : Path extends `${infer Head}${infer Tail}`
        ? SplitStorePath<Tail, Delimiter, `${Current}${Head}`, Parts>
        : [...Parts, Current];
