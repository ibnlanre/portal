import { composite, primitive } from "@ibnlanre/portal";
import { z } from "zod";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export const themeSchema = z.enum(["dark", "light", "system"]);
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
  theme: themeSchema,
});

export type AppPreferences = z.infer<typeof preferencesSchema>;
export type Theme = z.infer<typeof themeSchema>;

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
export const preferencesStore = composite({
  autoSave: initialValue.autoSave,
  language: initialValue.language,
  layout: composite(initialValue.layout),
  notifications: composite(initialValue.notifications),
  theme: primitive<Theme>(initialValue.theme),
});

// Load from IndexedDB when store is created
getStoredValue(initialValue).then((stored) => preferencesStore.$set(stored));

// Subscribe to store changes and auto-persist
preferencesStore.$subscribe(setStoredValue);
