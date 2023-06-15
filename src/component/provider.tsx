import { useState, type ReactNode, type Provider } from "react";
import type { PortalEntriesContext, PortalEntry, PortalMap } from "../entries";
import { portalEntries } from "../entries";

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
   * Removes an item from the portal entries based on the specified key.
   * 
   * @param {any} key The key of the item to remove.
   * @returns {void}
   */
  function removeItemFromEntries(key: string): void {
    setEntries((prevEntries) => {
      const newEntries = new Map(prevEntries);
      newEntries.get(key)?.observable?.unsubscribe();

      try {
        // Remove the key from entries
        newEntries.delete(key);

        // Remove the key from localStorage
        localStorage.removeItem(key);

        // Remove the key from sessionStorage
        sessionStorage.removeItem(key);

        // Delete the key from cookie storage
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } catch (error) {
        console.error(`Error occurred while deleting ${key}`, error);
      }

      return newEntries;
    });
  }

  const clearEntries = () => {
    setEntries((prevEntries) => {
      prevEntries.forEach(({ observable }) => {
        observable?.unsubscribe();
      });
      return new Map();
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
