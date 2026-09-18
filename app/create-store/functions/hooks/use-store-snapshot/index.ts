import type { DependencyList } from "react";

import type { Selector } from "@/create-store/types/selector";
import type { Snapshot } from "@/create-store/types/snapshot";

import { useMemo, useSyncExternalStore } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

/** Cache each selected snapshot until the source or selector changes. */
export function useStoreSnapshot<State, Value = Snapshot<State>>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => State,
  selector?: Selector<State, Value>,
  dependencies?: DependencyList
): Value {
  const version = useVersion(dependencies);
  const getSelection = useMemo(() => {
    let initialized = false;
    let previousState: State;
    let selection: Value;
    return () => {
      const state = getSnapshot();
      if (!initialized || !Object.is(previousState, state)) {
        const next = resolveSelectorValue(state, selector);
        previousState = state;
        if (!initialized || !Object.is(selection, next)) selection = next;
        initialized = true;
      }
      return selection;
    };
  }, [getSnapshot, selector, version]);

  return useSyncExternalStore(subscribe, getSelection, getSelection);
}
