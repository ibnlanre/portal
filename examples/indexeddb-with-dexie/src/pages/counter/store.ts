import { z } from "zod";

import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

const [getStoredCount, setStoredCount] =
  createIndexedDBAdapter<number>("counter");

// Load initial state from IndexedDB
const initialCount = await getStoredCount(0);

const counterSchema = z.object({
  value: z.number(),
  decrement: z.function(),
  increment: z.function(),
  reset: z.function(),
});

// Create the store with a schema
export const counterStore = createStore(counterSchema, {
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
