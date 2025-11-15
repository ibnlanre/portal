import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

export type StatePath<
  State extends GenericObject,
  Path extends Paths<State> = never,
> = [Path] extends [never] ? State : ResolvePath<State, Path>;
