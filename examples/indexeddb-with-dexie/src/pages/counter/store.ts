import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

const [getStoredCount, setStoredCount] =
  createIndexedDBAdapter<number>("counter");

// Load initial state from IndexedDB
const initialCount = await getStoredCount(0);

// Create the store
export const counterStore = createStore({
  value: initialCount,
  decrement() {
    counterStore.value.$set((prev) => prev - 1);
  },
  increment() {
    counterStore.value.$set((prev) => prev + 1);
  },
  reset() {
    counterStore.value.$set(0);
  },
});

// Subscribe to store changes and auto-persist
counterStore.$subscribe(({ value }) => {
  setStoredCount(value);
}, false);
