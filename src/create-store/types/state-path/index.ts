import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";

export type StatePath<State extends Dictionary, Path extends Paths<State>> =
  | State
  | ResolvePath<State, Path>;
