import type { CompositeStore } from "@/create-store/types/composite-store";
import type { IsNever } from "@/create-store/types/is-never";
import type { Paths } from "@/create-store/types/paths";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { ResolvePath } from "@/create-store/types/resolve-path";

export type InferType<
  Store extends PrimitiveStore<any>,
  Path extends Paths<
    Store extends CompositeStore<infer State> ? State : never
  > = never,
> =
  IsNever<Path> extends 1
    ? Store extends PrimitiveStore<infer State>
      ? State
      : never
    : Store extends CompositeStore<infer State>
      ? ResolvePath<State, Path>
      : never;
