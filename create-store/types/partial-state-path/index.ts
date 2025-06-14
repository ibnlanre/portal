import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

export type PartialStatePath<
  State extends Dictionary,
  Path extends Paths<State> = never
> = [Path] extends [never]
  ? DeepPartial<State>
  : DeepPartial<ResolvePath<State, Path>>;
