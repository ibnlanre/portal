export type WidenLiterals<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T;
