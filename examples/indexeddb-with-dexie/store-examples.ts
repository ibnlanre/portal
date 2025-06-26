import { createStore } from "../../create-store";
import { createIndexedDBAdapter } from "./src/utilities/create-indexeddb-adapter";

export interface Todo {
  completed: boolean;
  id: string;
  text: string;
}

export interface UserProfile {
  avatar?: string;
  email: string;
  lastLogin: Date;
  name: string;
  preferences: {
    notifications: boolean;
    theme: "dark" | "light";
  };
}

interface StoredUserProfile extends Omit<UserProfile, "lastLogin"> {
  lastLogin: string; // Store as ISO string for IndexedDB
}

// Example 1: Auto-persisting store with reactive updates
export function createAutoPersistStore<T>(key: string, initialValue?: T) {
  const [getStoredValue, setStoredValue] = createIndexedDBAdapter<T>(key);

  // Initialize with stored value or fallback to initial value
  const store = createStore(initialValue);

  // Load from IndexedDB when store is created
  getStoredValue(initialValue).then((storedValue) => {
    if (storedValue !== undefined) {
      store.$set(storedValue);
    }
  });

  // Subscribe to store changes and auto-persist
  store.$act(setStoredValue);

  return store;
}

// Example 2: Simple counter store with IndexedDB persistence
export async function createPersistedCounterStore() {
  const [getStoredCount, setStoredCount] =
    createIndexedDBAdapter<number>("counter");

  // Load initial state from IndexedDB
  const initialCount = await getStoredCount(0);

  // Create the store with initial state
  const counterStore = createStore({
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
  counterStore.value.$act(setStoredCount);

  return counterStore;
}

// Example 3: Todo list store with IndexedDB persistence
export async function createPersistedTodoStore() {
  const [getStoredTodos, setStoredTodos] =
    createIndexedDBAdapter<Todo[]>("todos");

  // Load initial state from IndexedDB
  const initialTodos = await getStoredTodos([]);

  // Create the store with initial state
  const todoStore = createStore({
    addTodo: (text: string) => {
      const newTodo: Todo = {
        completed: false,
        id: crypto.randomUUID(),
        text,
      };

      const currentTodos = todoStore.todos.$get();
      const updatedTodos = [...currentTodos, newTodo];

      todoStore.todos.$set(updatedTodos);
    },
    clearCompleted: () => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.filter((todo) => !todo.completed);

      todoStore.todos.$set(updatedTodos);
    },
    removeTodo: (id: string) => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.filter((todo) => todo.id !== id);

      todoStore.todos.$set(updatedTodos);
    },
    todos: initialTodos,
    toggleTodo: (id: string) => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );

      todoStore.todos.$set(updatedTodos);
    },
  });

  // Subscribe to store changes and auto-persist
  todoStore.todos.$act(setStoredTodos);

  return todoStore;
}

// Example 4: User profile store with custom serialization
export async function createPersistedUserProfileStore() {
  const [getStoredProfile, setStoredProfile] = createIndexedDBAdapter<
    UserProfile,
    StoredUserProfile
  >("userProfile", {
    storageTransform(profile) {
      return {
        ...profile,
        lastLogin: profile.lastLogin.toISOString(),
      };
    },
    usageTransform(profile) {
      return {
        ...profile,
        lastLogin: new Date(profile.lastLogin),
      };
    },
  });

  // Load initial state from IndexedDB
  const initialProfile = await getStoredProfile();

  const profileStore = createStore({
    login: (profile: UserProfile) => {
      const loginProfile = { ...profile, lastLogin: new Date() };
      profileStore.profile.$set(loginProfile);
    },
    logout: () => {
      // Clear profile (from store, and IndexedDB)
      profileStore.profile.$set(undefined);
    },
    profile: initialProfile,
    updatePreferences: (preferences: Partial<UserProfile["preferences"]>) => {
      const currentProfile = profileStore.profile.$get();
      if (!currentProfile) return;

      const updatedProfile = {
        ...currentProfile,
        preferences: { ...currentProfile.preferences, ...preferences },
      };

      profileStore.profile.$set(updatedProfile);
    },
    updateProfile: (updates: Partial<UserProfile>) => {
      const currentProfile = profileStore.profile.$get();
      if (!currentProfile) return;

      const updatedProfile = { ...currentProfile, ...updates };
      profileStore.profile.$set(updatedProfile);
    },
  });

  // Subscribe to store changes and auto-persist
  profileStore.profile.$act(setStoredProfile);

  return profileStore;
}
