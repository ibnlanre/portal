import { useEffect, type Provider, useState } from "react";

import { objectToStringKey } from "utilities";
import { portalEntries } from "entries";
import { portal } from "portal";

import type {
  PortalEntriesContext,
  PortalEntriesProvider,
  PortalEntry,
  PortalMap,
  StorageType,
} from "entries";

import { cookieStorage } from "./cookieStorage";

/**
 * Provider component for the portal system.
 *
 * @param children The child components.
 * @returns The PortalProvider component.
 */
export function PortalProvider({ children }: PortalEntriesProvider) {
  const [entries, setEntries] = useState<PortalMap<any, any>>(portal.value);

  useEffect(() => {
    // Subscribe portal to changes to entries.
    portal.next(entries);
  }, [entries]);

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
  const addItemToEntries = <S, A>(
    key: string,
    entry: PortalEntry<S, A>
  ): void => {
    setEntries((prevEntries) => {
      const newEntries = new Map(prevEntries) as PortalMap<any, any>;
      newEntries.set(key, entry);
      return newEntries;
    });
  };

  /**
   * Removes an item from the portal entries and browser storage based on the specified key and storage types.
   *
   * @param {any} key The key of the item to remove.
   * @param {("local" | "session" | "cookie")[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
   *
   * @returns {void}
   */
  const removeItemFromEntries = (
    key: any,
    storageTypes: Array<StorageType> = ["local", "session", "cookie"]
  ): void => {
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
            cookieStorage.removeItem(stringKey);
          } catch (error) {
            console.log(error);
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
  };

  /**
   * Clears all entries from the portal.
   * @returns {void}
   */
  const clearEntries = () => {
    entries.forEach((value) => {
      removeItemFromEntries(value);
    });
  };

  const EntriesProvider = portalEntries.Provider as Provider<
    PortalEntriesContext<any, any>
  >;

  return (
    <EntriesProvider
      value={{
        entries,
        clearEntries,
        removeItemFromEntries,
        addItemToEntries,
      }}
    >
      {children}
    </EntriesProvider>
  );
}
