import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export type Property<
  State extends GenericObject,
  Path extends Paths<State> = never,
> = StoreValueResolver<ResolvePath<State, Path>>;
