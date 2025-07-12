import type { AsyncFunction } from "@/create-store/types/async-function";
import type { AsyncState } from "@/create-store/types/async-state";

import { useEffect, useReducer } from "react";

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
export function useAsync<Data, Params>(
  effect: AsyncFunction<Data, Params>,
  params: Params = undefined as Params
): AsyncState<Data> {
  const comparison = useVersion(params);

  const [state, dispatch] = useReducer(reducer<Data>, {
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    dispatch({ type: "LOADING" });

    effect({ params, signal })
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
  }, comparison);

  return state;
}
