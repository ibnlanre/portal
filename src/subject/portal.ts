import { handleSSRError, objectToStringKey } from "utilities";
import { cookieStorage } from "component";

import type {
  CookieEntry,
  CookieOptions,
  PortalEntry,
  PortalMap,
  StorageType,
} from "definition";

import { BehaviorSubject } from "./behaviorSubject";
import { getCookieValue } from "cookies";

class Portal<S, A = undefined> {
  private portalMap: PortalMap<any, any> = new Map();

  get entries() {
    return this.portalMap;
  }

  /**
   * Generate the string representation of the key.
   * @param {any} key The key to be used.
   * @returns {string}
   */
  stringKey = (key: any) => objectToStringKey(key);

  /**
   * Creates a function to split the cookie value and options from a given `cookieEntry`.
   *
   * @param {any} key The key associated with the portal entry.
   * @param {CookieEntry?} [initialState] The initial state contained the cookie value and options.
   *
   * @returns {[string | undefined, CookieOptions]} An array containing the cookie value and options.
   * - The first element of the array is the cookie value (string) if available, otherwise `undefined`.
   * - The second element is an object representing the cookie options (e.g., `expires`, `path`, `domain`, `secure`, etc.).
   *   If no options are available, an empty object will be returned.
   */
  cook = (key: string, initialState?: CookieEntry) => {
    /**
     * Internal helper function to split the cookie value and options from a given `cookieEntry`.
     *
     * @param {CookieEntry} cookieEntry The cookie entry representing a portal entry.
     * @returns {[string | undefined, CookieOptions]} An array containing the cookie value and options.
     */
    const splitCookieValue = (
      cookieEntry: CookieEntry
    ): [string | undefined, CookieOptions] => {
      const { cookieOptions } = this.entries.get(key) || {};
      const { value, ...options } = { ...cookieOptions, ...cookieEntry };
      return [value, options];
    };

    const value = getCookieValue(key);
    if (value !== null) {
      // If the value is an empty string `""`, then it would be replaced
      // by the inputted value, if any. Else, it replaces the given value.
      const options = value === "" ? initialState : { ...initialState, value };
      return splitCookieValue({ ...options });
    }
    return splitCookieValue({ ...initialState });
  };

  /**
   * Retrieves the item with the specified key from the portal storage.
   *
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key The key of the item to be retrieved.
   * @param {boolean} [override=false] Whether to override an existing item with the same key.
   *
   * @returns {PortalEntry<S, A>} The portal entry with the specified key, or a new portal entry if not found.
   */
  getItem = (key: any, override: boolean = false): PortalEntry<S, A> => {
    const stringKey = this.stringKey(key);
    const subject = {
      observable: new BehaviorSubject(undefined as S),
      reducer: undefined,
    };
    if (!this.entries.has(stringKey)) this.addItem(key, subject);
    else if (!override) return this.entries.get(stringKey)!;
    return subject;
  };

  /**
   * Adds a new item to the internal map with the specified key and entry.
   *
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {any} key The key to add to the internal map.
   * @param {PortalEntry<S, A>} entry The portal entry to be associated with the key.
   *
   * @returns {void}
   */
  addItem = (key: any, entry: PortalEntry<S, A>): void => {
    const stringKey = this.stringKey(key);
    try {
      this.portalMap.set(stringKey, entry);
    } catch (error) {
      handleSSRError(error, `Error occurred while adding ${stringKey}:`);
    }
  };

  /**
   * Sets the value of a portal entry in the portal map.
   *
   * @description
   * If the entry already exists, its value will be replaced with the new value.
   * If the entry does not exist, a `warning` would be displayed in the `console`.
   * Furthermore, a new entry would be created with the specified key.
   *
   * @param {any} key The key of the portal entry.
   * @param {any} value The value to be set for the portal entry.
   * @returns {void}
   */
  setItem = (key: any, value: any): void => {
    const stringKey = this.stringKey(key);

    try {
      if (this.portalMap.has(stringKey)) {
        const originalValue = this.portalMap.get(stringKey)!;
        const setter = originalValue.observable.watch();
        setter(value);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("The key:", key, "does not exist in portal entries");
        }

        this.portalMap.set(stringKey, {
          observable: new BehaviorSubject(value),
          reducer: undefined,
        });
      }
    } catch (error) {
      handleSSRError(error, `Error occured while setting ${stringKey}:`);
    }
  };

  /**
   * Checks if the specified key exists in the internal map.
   *
   * @param {any} key The key to check for existence.
   * @returns {boolean} `true` if the key exists in the internal map, otherwise `false`.
   */
  hasItem = (key: any): boolean => {
    const stringKey = this.stringKey(key);
    return this.portalMap.has(stringKey);
  };

  /**
   * Deletes the item with the specified key from the internal map.
   *
   * @param {any} key The key of the item to be deleted.
   * @returns {void}
   */
  deleteItem = (key: any) => {
    const stringKey = this.stringKey(key);

    // Unsubscribe the observable associated with the item
    this.portalMap.get(stringKey)?.observable?.unsubscribe();

    try {
      // Delete the item from the internal map
      this.portalMap.delete(stringKey);
    } catch (error) {
      handleSSRError(error, `Error occurred while deleting ${stringKey}`);
    }
  };

  /**
   * Removes the item with the specified key from the storage.
   *
   * @param {any} key The key of the item to be removed.
   * @param {StorageType} storageType The type of storage to remove the item from.
   * @returns {void}
   */
  deletePersistedItem = (key: any, storageType: StorageType): void => {
    const stringKey = this.stringKey(key);

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
        // Remove the key from document.cookie
        cookieStorage.removeItem(stringKey);
        break;

      default:
        console.warn(`Invalid storage type: ${storageType}`);
        break;
    }
  };

  /**
   * Removes an item from the portal entries and browser storage based on the specified key and storage types.
   *
   * @param {any} key The key of the item to remove.
   * @param {StorageType[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
   *
   * @returns {void}
   */
  removeItemFromEntries = (
    key: any,
    storageTypes: Array<StorageType> = ["local", "session", "cookie"]
  ): void => {
    const removeFromStorageIterator = () => {
      for (const storageType of storageTypes) {
        this.deletePersistedItem(key, storageType);
      }
    };

    try {
      // Remove from application state
      this.deleteItem(key);

      // Remove from specified storage types, if provided
      if (storageTypes) {
        // Check if the DOM is mounted before executing the removal
        if (typeof window !== "undefined") removeFromStorageIterator();
        else {
          // Delay the removal until the DOM is mounted
          setTimeout(removeFromStorageIterator, 0);
        }
      }
    } catch (error) {
      handleSSRError(error);
    }
  };

  /**
   * Clears all entries from the portal.
   * @returns {void}
   */
  clearEntries = (): void => {
    try {
      this.portalMap.forEach((value) => {
        this.removeItemFromEntries(value);
      });
    } catch (error) {
      handleSSRError(error, `Error occured while clearing portal`);
    }
  };
}

/**
 * Represents a mapping of keys (stringified) to portal entries.
 * @type {PortalMap<any, any>}
 */
export const portal = new Portal<any, any>();
