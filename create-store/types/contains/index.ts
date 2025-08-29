import type { IsNever } from "@/create-store/types/is-never";

export type Contains<T, Arr extends readonly unknown[]> =
  IsNever<T> extends 1
    ? ContainsNever<Arr>
    : Arr[number] extends infer Type
      ? [T] extends [Type]
        ? 1
        : 0
      : never;

type ContainsNever<Arr extends readonly unknown[]> = Arr extends readonly [
  infer First,
  ...infer Rest,
]
  ? IsNever<First> extends 1
    ? 1
    : ContainsNever<Rest>
  : 0;
