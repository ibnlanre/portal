import type { Dispatch, SetStateAction } from "react";

import type { Dictionary } from "@/store/types/dictionary";
import type { Paths } from "@/store/types/paths";
import type { ResolvePath } from "@/store/types/resolve-path";
import type { StateManager } from "@/store/types/state-manager";
import type { Subscriber } from "@/store/types/subscriber";

export interface CompositeStore<State extends Dictionary> {
  $get(): State;
  $get<Path extends Paths<State>, Value extends ResolvePath<State, Path>>(
    path: Path
  ): Value;
  $set(): Dispatch<SetStateAction<State>>;
  $set<Path extends Paths<State>, Value extends ResolvePath<State, Path>>(
    path: Path
  ): Dispatch<SetStateAction<Value>>;
  $sub(subscriber: Subscriber<State>): () => void;
  $sub<Path extends Paths<State>, Value extends ResolvePath<State, Path>>(
    subscriber: (value: Value) => void,
    path: Path
  ): () => void;
  $use(): StateManager<State>;
  $use<Path extends Paths<State>>(
    path?: Path
  ): StateManager<ResolvePath<State, Path>>;
}
