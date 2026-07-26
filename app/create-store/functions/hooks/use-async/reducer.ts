import type { AsyncAction } from "@/create-store/types/async-action";
import type { AsyncState } from "@/create-store/types/async-state";

export function reducer<Data>(
  state: AsyncState<Data>,
  action: AsyncAction<Data>
): AsyncState<Data> {
  switch (action.type) {
    case "ERROR": {
      const error = action.payload;
      return { data: null, error, isLoading: false };
    }
    case "LOADING": {
      return { data: null, error: null, isLoading: true };
    }
    case "SUCCESS": {
      const data = action.payload;
      return { data, error: null, isLoading: false };
    }
    default:
      return state;
  }
}
