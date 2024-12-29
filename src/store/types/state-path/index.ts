import type { Dictionary } from "@/store/types/dictionary";
import type { Paths } from "@/store/types/paths";
import type { ResolvePath } from "@/store/types/resolve-path";

export type StatePath<State extends Dictionary, Path extends Paths<State>> =
  | State
  | ResolvePath<State, Path>;
