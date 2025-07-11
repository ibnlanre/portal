import type { AsyncEffectCallback } from "@/create-store/types/async-effect-callback";
import type { AsyncState } from "@/create-store/types/async-state";

import { type DependencyList, useEffect, useReducer } from "react";

import { reducer } from "./reducer";
import { useVersion } from "@/create-store/functions/hooks/use-version";

/**
 * A custom hook for handling asynchronous effects with loading, error, and data states.
 *
 * @param effect The async function to execute
 * @param dependencies Dependencies array to trigger re-execution
 *
 * @returns An object containing data, loading, error states and an execute function
 */
export function useAsync<Data>(
  effect: AsyncEffectCallback<Data>,
  dependencies: DependencyList = []
): AsyncState<Data> {
  const comparison = useVersion(dependencies);

  const [state, dispatch] = useReducer(reducer<Data>, {
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    const signal = controller.signal;
    const active = !signal.aborted;

    dispatch({ type: "LOADING" });

    effect(signal)
      .then((payload) => {
        if (active) dispatch({ payload, type: "SUCCESS" });
      })
      .catch((error) => {
        const isError = error instanceof Error;
        const payload = isError ? error : new Error(String(error));
        if (active) dispatch({ payload, type: "ERROR" });
      });

    return () => {
      controller.abort();
    };
  }, comparison);

  return state;
}
