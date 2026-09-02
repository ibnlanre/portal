import { z } from "zod";

import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export const preferencesSchema = z.object({
  autoSave: z.boolean(),
  language: z.string(),
  layout: z.object({
    compactMode: z.boolean(),
    sidebar: z.boolean(),
  }),
  notifications: z.object({
    desktop: z.boolean(),
    email: z.boolean(),
    push: z.boolean(),
  }),
  theme: z.enum(["dark", "light", "system"]),
});

export type AppPreferences = z.infer<typeof preferencesSchema>;

export const initialValue: AppPreferences = {
  autoSave: true,
  language: "en",
  layout: {
    compactMode: false,
    sidebar: true,
  },
  notifications: {
    desktop: true,
    email: true,
    push: false,
  },
  theme: "system",
};

const [getStoredValue, setStoredValue] =
  createIndexedDBAdapter<AppPreferences>("appPreferences");

// Initialize with stored value or fallback to initial value
export const preferencesStore = createStore(preferencesSchema, initialValue);

// Load from IndexedDB when store is created
getStoredValue(initialValue).then(preferencesStore.$set);

// Subscribe to store changes and auto-persist
preferencesStore.$subscribe(setStoredValue);
