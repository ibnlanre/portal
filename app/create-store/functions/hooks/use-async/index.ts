import type { DependencyList } from "react";

import type { AsyncFunction } from "@/create-store/types/async-function";
import type { AsyncState } from "@/create-store/types/async-state";

import { useEffect, useReducer } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

import { reducer } from "./reducer";

/**
 * A custom hook for handling asynchronous effects with loading, error, and data states.
 *
 * @param effect The async function to execute
 * @param dependencies Dependencies array to trigger re-execution
 *
 * @returns An object containing data, loading, error states and an execute function
 */
export function useAsync<Data>(
  effect: AsyncFunction<Data>,
  dependencies: DependencyList = []
): AsyncState<Data> {
  const version = useVersion(dependencies);

  const [state, dispatch] = useReducer(reducer<Data>, {
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    dispatch({ type: "LOADING" });

    effect(controller)
      .then((payload) => {
        if (!signal.aborted) {
          dispatch({ payload, type: "SUCCESS" });
        }
      })
      .catch((error) => {
        if (!signal.aborted) {
          const isError = error instanceof Error;
          const payload = isError ? error : new Error(String(error));
          dispatch({ payload, type: "ERROR" });
        }
      });

    return () => {
      controller.abort();
    };
  }, [version]);

  return state;
}
