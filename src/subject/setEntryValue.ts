import { portal } from "./portal";

import { objectToStringKey } from "utilities";
import { BehaviorSubject } from "subject";

export function setEntryValue(key: any, value: any) {
  const stringKey = objectToStringKey(key);
  
  if (portal.has(stringKey)) {
    const originalValue = portal.get(stringKey)!;
    const setter = originalValue.observable.watch();
    setter(value);
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("The key:", key, "does not exist in portal entries");
    }

    portal.set(stringKey, {
      observable: new BehaviorSubject(value),
      reducer: undefined,
    });
  }
}
