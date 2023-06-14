import { type BehaviorSubject } from "rxjs";

import { usePortalEntries } from "../entries";
import { usePortalReducers } from "../reducers";
import { useEffect } from "react";

/**
 * Hook for deleting a key from storage, reducers, and entries.
 * @template S - The type of the state.
 * @template A - The type of the action (optional).
 * @param {string} key - The key to delete.
 * @returns {void}
 */
export function usePortalWithDelete<S, A = undefined>(key: string): void {
  const { removeItemFromReducers } = usePortalReducers<S, A>();
  const { removeItemFromEntries } = usePortalEntries<
    string,
    BehaviorSubject<S>
  >();

  useEffect(() => {
    try {
      // Remove the key from localStorage
      localStorage.removeItem(key);

      // Remove the key from sessionStorage
      sessionStorage.removeItem(key);

      // Remove the key from reducers
      removeItemFromReducers(key);

      // Remove the key from entries
      removeItemFromEntries(key);

      // Delete the key from cookie storage
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error(`Error occurred while deleting ${key}`, error);
    }
  }, []);
}
