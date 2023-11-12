import { handleSSRError } from "@/utilities";
import { cookieStorage } from "@/component";

import type {
  CookieEntry,
  CookieOptions,
  PortalMap,
  PortalValue,
  StorageType,
} from "@/definition";

import { BehaviorSubject } from "./behaviorSubject";

class Portal {
  private portalMap: PortalMap<any, any> = new Map();
  
  /**
   * A map of portal entries.
   * @type {PortalMap}
   */
  get entries() {
    return this.portalMap;
  }

  /**
   * Creates a function to split the cookie value and options from a given `cookieEntry`.
   *
   * @param {string} path The path associated with the portal entry.
   * @param {CookieEntry?} [initialState] The initial state containing the cookie value and options.
   *
   * @returns {[string | undefined, CookieOptions]} An array containing the cookie value and options.
   * - The first element of the array is the cookie value (string) if available, otherwise `undefined`.
   * - The second element is an object representing the cookie options (e.g., `expires`, `path`, `domain`, `secure`, etc.).
   *   If no options are available, an empty object will be returned.
   */
  resolveCookieEntry = <Path extends string>(
    path: Path,
    initialState: string,
    options?: CookieOptions
  ) => {
    const value = cookieStorage.getItem(path);
    const observable = this.entries.get(path) as
      | BehaviorSubject<CookieEntry>
      | undefined;

    const cookieOptions = {
      value: initialState,
      ...options,
    };

    const resolvedCookieValue = {
      ...cookieOptions,
      ...observable?.value,
    };

    if (value) {
      return {
        ...resolvedCookieValue,
        // If the value is an empty string `""`, then it would be replaced
        // by the inputted value, if any. Else, it replaces the given value.
        value,
      };
    }

    return resolvedCookieValue;
  };

  /**
   * Retrieves the item with the specified path from the portal storage.
   *
   * @description
   * If the item does not exist, a new item will be created with the specified path.
   * If the item exists, its value will be updated with the specified value.
   *
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {string} path The path of the item to be retrieved.
   * @param {State} initialState The initial state of the item.
   * @param {boolean} [override=false] Whether to override an existing item with the same path.
   *
   * @returns {PortalValue<State>} The portal entry with the specified path, or a new portal entry if not found.
   */
  getItem = <State, Path extends string>(
    path: Path,
    initialState: State,
    override: boolean = false
  ): PortalValue<State> => {
    if (!override && this.portalMap.has(path)) {
      return this.portalMap.get(path) as PortalValue<State>;
    }

    const subject = {
      observable: new BehaviorSubject(initialState),
      storage: new Set<Storage>(),
    };

    if (!this.portalMap.has(path)) this.portalMap.set(path, subject);
    return subject;
  };

  /**
   * Adds a new item to the internal map with the specified path and entry.
   *
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {any} path The path to add to the internal map.
   * @param {PortalValue<State>} entry The portal entry to be associated with the path.
   *
   * @returns {void}
   */
  addItem = <State, Path>(path: Path, entry: PortalValue<State>): void => {
    try {
      this.portalMap.set(path, entry);
    } catch (error) {
      handleSSRError(error, `Error occurred while adding ${path}:`);
    }
  };

  /**
   * Sets the value of a portal entry in the portal map.
   *
   * @description
   * If the entry already exists, its value will be replaced with the new value.
   * If the entry does not exist, a `warning` would be displayed in the `console`.
   * Furthermore, a new entry would be created with the specified path.
   * 
   * @template State The type of the state.
   * @template Path The type of the path.
   *
   * @param {any} path The path of the portal entry.
   * @param {any} value The value to be set for the portal entry.
   * 
   * @returns {void}
   */
  setItem = <State, Path>(path: Path, value: State): void => {
    try {
      if (this.portalMap.has(path)) {
        const originalValue = this.portalMap.get(path)!;
        originalValue.observable.setter(value);
      } else {
        console.warn("The path:", path, "does not exist in portal entries");
        this.portalMap.set(path, {
          observable: new BehaviorSubject(value),
          storage: new Set<Storage>(),
        });
      }
    } catch (error) {
      handleSSRError(error, `Error occured while setting ${path}:`);
    }
  };

  /**
   * Checks if the specified path exists in the internal map.
   * 
   * @template Path The type of the path.
   *
   * @param {any} path The path to check for existence.
   * @returns {boolean} `true` if the path exists in the internal map, otherwise `false`.
   */
  hasItem = <Path>(path: Path): boolean => {
    return this.portalMap.has(path);
  };

  /**
   * Deletes the item with the specified path from the internal map.
   * 
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to be deleted.
   * @returns {void}
   */
  deleteItem = <Path>(path: Path) => {
    // Unsubscribe the observable associated with the item
    const subject = this.portalMap.get(path);
    if (subject) subject.observable.unsubscribe();

    try {
      // Delete the item from the internal map
      this.portalMap.delete(path);
    } catch (error) {
      handleSSRError(error, `Error occurred while deleting ${path}`);
    }
  };

  /**
   * Removes the item with the specified path from the storage.
   * 
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to be removed.
   * @param {StorageType} storageType The type of storage to remove the item from.
   * 
   * @returns {void}
   */
  deletePersistedItem = <Path extends string>(
    path: Path,
    storageType: StorageType
  ): void => {
    switch (storageType) {
      case "local":
        try {
          // Remove the path from localStorage
          if (typeof localStorage !== "undefined")
            localStorage.removeItem(path);
        } catch (error) {
          console.error(
            `Error occurred deleting ${path} from localStorage`,
            error
          );
        }
        break;

      case "session":
        try {
          // Remove the path from sessionStorage
          if (typeof sessionStorage !== "undefined")
            sessionStorage.removeItem(path);
        } catch (error) {
          console.error(
            `Error occurred deleting ${path} from sessionStorage`,
            error
          );
        }
        break;

      case "cookie":
        // Remove the path from document.cookie
        cookieStorage.removeItem(path);
        break;

      default:
        console.warn(`Invalid storage type: ${storageType}`);
        break;
    }
  };

  /**
   * Removes an item from the portal entries and browser storage based on the specified path and storage types.
   * 
   * @template Path The type of the path.
   *
   * @param {any} path The path of the item to remove.
   * @param {StorageType[]} [storageTypes] An optional array of storage types to remove the item from (e.g., "local", "session", "cookie").
   *
   * @returns {void}
   */
  removeItemFromEntries = <Path extends string>(
    path: Path,
    storageTypes: Array<StorageType> = ["local", "session", "cookie"]
  ): void => {
    const removeFromStorageIterator = () => {
      for (const storageType of storageTypes) {
        this.deletePersistedItem(path, storageType);
      }
    };

    try {
      // Remove from application state
      this.deleteItem(path);

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
      this.portalMap.forEach((value, path) => {
        this.removeItemFromEntries(path);
      });
    } catch (error) {
      handleSSRError(error, `Error occured while clearing portal`);
    }
  };
}

/**
 * Represents a mapping of keys (stringified) to portal entries.
 * @type {PortalMap}
 */
export const portal = new Portal();
