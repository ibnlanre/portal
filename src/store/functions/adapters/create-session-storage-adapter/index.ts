import type { Initializer } from "@/store/types/initializer";
import type { Subscriber } from "@/store/types/subscriber";

import { reportException } from "@/store/functions/utilities/report-exeption";

export function createSessionStorageAdapter<State>(
  key: string,
  fallback?: State
): [
  getSessionStorageState: Initializer<State>,
  setSessionStorageState: Subscriber<State>
] {
  const getSessionStorageState = (): State => {
    const value = sessionStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as State;
      } catch (exception) {
        reportException({
          message: "Failed to parse stored value from sessionStorage:",
          exception,
          key,
          value,
        });
      }
    }
    return fallback as State;
  };

  const setSessionStorageState = (value: State) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (exception) {
      reportException({
        message: "Failed to store value in sessionStorage:",
        exception,
        key,
        value,
      });
    }
  };

  return [getSessionStorageState, setSessionStorageState];
}
