import type { Selector } from "@/create-store/types/selector";
import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch, SetStateAction } from "react";

export type PrimitiveStore<State> = {
  $get<Value = State>(select?: Selector<State, Value>): Value;
  $set: Dispatch<SetStateAction<State>>;
  $sub(subscriber: Subscriber<State>): () => void;
  $use<Value = State>(
    select?: Selector<State, Value>
  ): StateManager<State, Value>;
};
