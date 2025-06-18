import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { SetPartial } from "@/create-store/types/set-partial";

export type PartialStatePath<
  State extends Dictionary,
  Path extends Paths<State> = never,
> = [Path] extends [never]
  ? SetPartial<State>
  : SetPartial<ResolvePath<State, Path>>;
