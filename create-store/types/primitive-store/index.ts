import type { Dispatch, SetStateAction } from "react";

import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";

export type PrimitiveStore<State> = {
  $get(): State;
  $set: Dispatch<SetStateAction<State>>;
  $sub(subscriber: Subscriber<State>): () => void;
  $use(): StateManager<State>;
};
