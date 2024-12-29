import type { Initializer } from "@/store/types/initializer";
import type { Subscriber } from "@/store/types/subscriber";

import { reportException } from "@/store/functions/utilities/report-exeption";

export function createLocalStorageAdapter<State>(
  key: string,
  fallback?: State
): [
  getLocalStorageState: Initializer<State>,
  setLocalStorageState: Subscriber<State>
] {
  const getLocalStorageState = (): State => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (exception) {
        reportException({
          message: "Failed to parse stored value from localStorage:",
          exception,
          key,
          value,
        });
      }
    }
    return <State>fallback;
  };

  const setLocalStorageState = (value: State) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (exception) {
      reportException({
        message: "Failed to store value in localStorage:",
        exception,
        key,
        value,
      });
    }
  };

  return [getLocalStorageState, setLocalStorageState];
}
