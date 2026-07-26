import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

export type PartialStatePath<
  State extends GenericObject,
  Path extends Paths<State> = never,
> = [Path] extends [never]
  ? DeepPartial<State>
  : DeepPartial<ResolvePath<State, Path>>;
