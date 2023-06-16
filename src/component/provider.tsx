import { useState, type ReactNode, type Provider } from "react";

import type {
  PortalEntriesContext,
  PortalEntry,
  PortalMap,
  StorageType,
} from "../entries";
import { portalEntries } from "../entries";
import { getCookieValue, objectToStringKey } from "../utilities";

interface IPortalEntriesProvider {
  children: ReactNode;
}

/**
 * Provider component for the portal system.
 * @param children The child components.
 * @returns The PortalProvider component.
 */
export function PortalProvider<S, A>({ children }: IPortalEntriesProvider) {
  const [entries, setEntries] = useState<PortalMap<any, any>>(new Map());

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
      const copiedMap = new Map(originalMap) as PortalMap<any, any>;
      copiedMap.set(key, entry);
      return copiedMap;
    });
  }

  /**
   * Removes an item from the portal entries and browser storage based on the specified key and storage types.
   *
   * @param {any} key - The key of the item to remove.
   * @param {("local" | "session" | "cookie")[]} [storageTypes] - An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
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
          try {
            // Delete the key from cookie storage
            if (typeof document !== "undefined") {
              const cookieValue = getCookieValue(stringKey);
              if (cookieValue) {
                document.cookie = `${stringKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              }
            }
          } catch (error) {
            console.error(
              `Error occurred deleting ${stringKey} from document.cookie`,
              error
            );
          }
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
        clearEntries,
        removeItemFromEntries,
        addItemToEntries,
        entries,
      }}
    >
      {children}
    </EntriesProvider>
  );
}
