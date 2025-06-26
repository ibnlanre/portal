import { createIndexedDBAdapter } from "src/utilities/create-indexeddb-adapter";

import { createStore } from "@/create-store";
import { Paths } from "@/create-store/types/paths";
import { ResolvePath } from "@/create-store/types/resolve-path";
import { combine } from "@/create-store/functions/helpers/combine";

type AppPreferences = {
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
export const preferencesStore = createStore(
  combine(initialValue, {
    update: (
      path: Paths<AppPreferences>,
      value: ResolvePath<AppPreferences, typeof path>
    ) => {
      preferencesStore.$key(path).$set(value);
    },
  })
);

// Load from IndexedDB when store is created
getStoredValue(initialValue).then(preferencesStore.$set);

// Subscribe to store changes and auto-persist
preferencesStore.$act(setStoredValue);
