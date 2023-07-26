import { useState, type Provider } from "react";

import { getCookieValueByRegex } from "cookies";
import { objectToStringKey } from "utilities";
import { portalEntries } from "subject";

import type {
  CookieEntry,
  CookieOptions,
  PortalEntriesContext,
  PortalEntriesProvider,
  PortalEntry,
  StorageType,
  PortalMap,
} from "definition";
import { cookieStorage } from "./cookieStorage";

/**
 * Provider component for the portal system.
 *
 * @param children The child components.
 * @returns The PortalProvider component.
 */
export function PortalProvider<S, A>({ children }: PortalEntriesProvider) {
  const [entries, setEntries] = useState<PortalMap<any, any>>(new Map());

  /**
   * Creates a function to split the cookie value and options from a given `cookieEntry`.
   *
   * @param {any} key The key associated with the portal entry.
   * @param {CookieEntry?} [initialState] The initial state containing the cookie value and options.
   *
   * @returns {[string | undefined, CookieOptions]} An array containing the cookie value and options.
   * - The first element of the array is the cookie value (string) if available, otherwise `undefined`.
   * - The second element is an object representing the cookie options (e.g., `expires`, `path`, `domain`, `secure`, etc.).
   *   If no options are available, an empty object will be returned.
   */
  function splitCookieEntry(key: string, initialState?: CookieEntry) {
    /**
     * Internal helper function to split the cookie value and options from a given `cookieEntry`.
     *
     * @param {CookieEntry} cookieEntry The cookie entry representing a portal entry.
     * @returns {[string | undefined, CookieOptions]} An array containing the cookie value and options.
     */
    const splitValueFromOptions = (
      cookieEntry: CookieEntry
    ): [string | undefined, CookieOptions] => {
      const { cookieOptions } = entries.get(key) || {};
      const { value, ...options } = { ...cookieOptions, ...cookieEntry };
      return [value, options];
    };

    const value = getCookieValueByRegex(key);
    if (value !== null) {
      return splitValueFromOptions({ ...initialState, value });
    }
    return splitValueFromOptions({ ...initialState });
  }

  /**
   * Updates the portal entries by adding a new key-value pair.
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key The key.
   * @param {PortalEntry<S, A>} entry The value.
   *
   * @returns {void}
   */
  function addItemToEntries<S, A>(key: string, entry: PortalEntry<S, A>): void {
    setEntries((originalMap) => {
      const newEntries = new Map(originalMap);
      newEntries.set(key, entry);
      return newEntries;
    });
  }

  /**
   * Removes an item from the portal entries and browser storage based on the specified key and storage types.
   *
   * @param {any} key The key of the item to remove.
   * @param {("local" | "session" | "cookie")[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
   *
   * @returns {void}
   */
  function removeItemFromEntries(
    key: any,
    storageTypes: Array<StorageType> = ["local", "session", "cookie"]
  ): void {
    const stringKey = objectToStringKey(key);

    const removeFromState = () => {
      setEntries((prevEntries) => {
        const newEntries = new Map(prevEntries);
        newEntries.get(stringKey)?.observable?.unsubscribe();

        try {
          // Remove the key from entries
          newEntries.delete(stringKey);
        } catch (error) {
          console.error(`Error occurred while deleting ${stringKey}`, error);
        }

        return newEntries;
      });
    };

    const removeFromStorage = (storageType: StorageType) => {
      switch (storageType) {
        case "local":
          try {
            // Remove the key from localStorage
            if (typeof localStorage !== "undefined")
              localStorage.removeItem(stringKey);
          } catch (error) {
            console.error(
              `Error occurred deleting ${stringKey} from localStorage`,
              error
            );
          }
          break;

        case "session":
          try {
            // Remove the key from sessionStorage
            if (typeof sessionStorage !== "undefined")
              sessionStorage.removeItem(stringKey);
          } catch (error) {
            console.error(
              `Error occurred deleting ${stringKey} from sessionStorage`,
              error
            );
          }
          break;

        case "cookie":
          // Delete the key from cookie storage
          cookieStorage.removeItem(stringKey);
          break;

        default:
          console.warn(`Invalid storage type: ${storageType}`);
          break;
      }
    };

    const removeFromStorageIterator = () => {
      for (const storageType of storageTypes) {
        removeFromStorage(storageType);
      }
    };

    // Remove from application state
    removeFromState();

    // Remove from specified storage types, if provided
    if (storageTypes) {
      // Check if the DOM is mounted before executing the removal
      if (typeof window !== "undefined") removeFromStorageIterator();
      else {
        // Delay the removal until the DOM is mounted
        setTimeout(removeFromStorageIterator, 0);
      }
    }
  }

  const clearEntries = () => {
    entries.forEach((value) => {
      removeItemFromEntries(value);
    });
  };

  const EntriesProvider = portalEntries.Provider as Provider<
    PortalEntriesContext<S, A>
  >;

  return (
    <EntriesProvider
      value={{
        entries,
        removeItemFromEntries,
        addItemToEntries,
        splitCookieEntry,
        clearEntries,
      }}
    >
      {children}
    </EntriesProvider>
  );
}
