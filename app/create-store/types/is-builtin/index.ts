import type { BuiltIn } from "@/create-store/types/built-in";
import type { IsAny } from "@/create-store/types/is-any";
import type { IsNever } from "@/create-store/types/is-never";
import type { IsUnknown } from "@/create-store/types/is-unknown";

export type IsBuiltIn<T> =
  IsNever<T> extends 1
    ? 1
    : IsAny<T> extends 1
      ? 1
      : IsUnknown<T> extends 1
        ? 1
        : [T] extends [BuiltIn]
          ? 1
          : 0;
