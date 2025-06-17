import type { Factory } from "@/create-store/types/factory";
import type { Possible } from "@/create-store/types/possible";

import { isFunction } from "@/create-store/functions/assertions/is-function";

export function resolveValue<State>(
  initialState?: Possible<Factory<State | undefined>>
): State {
  if (isFunction<State>(initialState)) return initialState();
  return initialState as State;
}
