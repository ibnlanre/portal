import { portal } from "./map";

import { cookieStorage } from "component";
import { objectToStringKey } from "utilities";

import type { StorageType } from "entries";

/**
 * Removes an item from the portal entries and browser storage based on the specified key and storage types.
 *
 * @param {any} key The key of the item to remove.
 * @param {("local" | "session" | "cookie")[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
 *
 * @returns {void}
 */
export function removeItemFromEntries(
  key: any,
  storageTypes: Array<StorageType> = ["local", "session", "cookie"]
): void {
  const stringKey = objectToStringKey(key);

  const removeFromState = () => {
    portal.get(stringKey)?.observable?.unsubscribe();

    try {
      // Remove the key from entries
      portal.delete(stringKey);
    } catch (error) {
      console.error(`Error occurred while deleting ${stringKey}`, error);
    }
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
}
