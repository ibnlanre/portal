import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export type AppPreferences = {
  autoSave: boolean;
  language: string;
  layout: {
    compactMode: boolean;
    sidebar: boolean;
  };
  notifications: {
    desktop: boolean;
    email: boolean;
    push: boolean;
  };
  theme: "dark" | "light" | "system";
};

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
export const preferencesStore = createStore(initialValue);

// Load from IndexedDB when store is created
getStoredValue(initialValue).then(preferencesStore.$set);

// Subscribe to store changes and auto-persist
preferencesStore.$act(setStoredValue);
