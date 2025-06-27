import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

import { createStore } from "@ibnlanre/portal";

const [getStoredCount, setStoredCount] =
  createIndexedDBAdapter<number>("counter");

// Load initial state from IndexedDB
const initialCount = await getStoredCount(0);

// Create the store with initial state
export const counterStore = createStore({
  decrement: () => {
    const newValue = counterStore.value.$get() - 1;
    counterStore.value.$set(newValue);
  },
  increment: () => {
    const newValue = counterStore.value.$get() + 1;
    counterStore.value.$set(newValue);
  },
  reset: () => {
    counterStore.value.$set(0);
  },
  value: initialCount,
});

// Subscribe to store changes and auto-persist
counterStore.value.$act(setStoredCount, false);
