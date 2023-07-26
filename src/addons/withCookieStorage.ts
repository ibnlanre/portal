import { useEffect, type Reducer } from "react";

import { usePortalEntries } from "subject";
import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";

import type { CookieEntry, PortalState } from "definition";

import { usePortalImplementation } from "./withImplementation";

export function usePortalWithCookieStorage<
  S extends CookieEntry,
  A = undefined
>(
  key: any,
  initialState: S,
  reducer?: Reducer<string, A>
): PortalState<string, A> {
  const { splitCookieEntry } = usePortalEntries();
  const stringKey = objectToStringKey(key);

  // Check whether the component is wrapped with the portal provider.
  if (!splitCookieEntry) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  const [value, cookieOptions] = splitCookieEntry(stringKey, initialState);
  const [state, setState] = usePortalImplementation<string, A>({
    key: stringKey,
    initialState: value,
    cookieOptions,
    reducer,
  });

  useEffect(() => {
    if (typeof state !== "undefined") {
      cookieStorage.setItem(stringKey, state, cookieOptions);
    }
  }, [state, value, objectToStringKey(cookieOptions)]);

  return [state, setState];
}
