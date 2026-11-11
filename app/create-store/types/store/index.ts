import type { DependencyList } from "react";

import type { Setter } from "@/create-store/types/setter";
import type { SubscribeOptions } from "@/create-store/types/subscribe-options";

/** What every store, branch and collection offers. */
export interface Store<State, Input = State> {
  readonly $dispose: () => void;
  readonly $get: {
    (): State;
    <Selected>(select: (state: State) => Selected): Selected;
  };
  readonly $onDispose: (cleanup: () => void) => () => void;
  readonly $reset: () => void;
  readonly $set: Setter<State, Input>;
  readonly $subscribe: (
    subscriber: (value: State) => void,
    options?: SubscribeOptions
  ) => () => void;
  readonly $use: {
    (): [state: State, set: Setter<State, Input>];
    <Selected>(
      select: (state: State) => Selected,
      dependencies?: DependencyList
    ): [state: Selected, set: Setter<State, Input>];
  };
}
