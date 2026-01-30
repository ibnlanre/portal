import type { IsAny } from "@/create-store/types/is-any";

export type IsNullable<T> =
  IsAny<T> extends 1
    ? false
    : null extends T
      ? true
      : undefined extends T
        ? true
        : false;
