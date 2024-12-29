import type { Dispatch, SetStateAction } from "react";

import type { StateManager } from "@/store/types/state-manager";
import type { Subscriber } from "@/store/types/subscriber";

export interface PrimitiveStore<State> {
  $get(): State;
  $set(): Dispatch<SetStateAction<State>>;
  $sub(subscriber: Subscriber<State>): () => void;
  $use(): StateManager<State>;
}
