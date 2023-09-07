import { useEffect, type Reducer } from "react";

import { portal } from "subject";
import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";

import type { CookieEntry, PortalState } from "definition";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<
  S extends CookieEntry,
  A = undefined
>(
  key: any,
  initialState?: S,
  reducer?: Reducer<string, A>
): PortalState<string, A> {
  const stringKey = objectToStringKey(key);

  const [value, cookieOptions] = portal.splitCookieEntry(
    stringKey,
    initialState
  );

  const [state, setState] = usePortalImplementation({
    key: stringKey,
    initialState: value,
    cookieOptions,
    reducer,
  });

  useEffect(() => {
    if (typeof state !== "undefined") {
      cookieStorage.setItem(stringKey, state, cookieOptions);
    }
  }, [state]);

  return [state, setState];
}
