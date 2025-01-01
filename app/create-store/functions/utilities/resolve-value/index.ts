import type { Factory } from "@/create-store/types/factory";

import { isFunction } from "@/create-store/functions/assertions/is-function";
import type { Possible } from "@/create-store/types/possible";

export function resolveValue<State>(
  initialState: Possible<Factory<State | undefined>>
): State {
  if (isFunction<State>(initialState)) return initialState();
  return <State>initialState;
}
