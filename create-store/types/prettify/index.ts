export type Prettify<T extends Array<any>> = T extends []
  ? {}
  : T extends [infer First, ...infer Rest]
    ? PrettifyHelper<First & Prettify<Rest>>
    : never;

type PrettifyHelper<T> = {
  [K in keyof T]: T[K];
} & {};
