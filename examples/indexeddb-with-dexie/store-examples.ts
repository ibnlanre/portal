import { createStore } from "../../create-store";
import { createIndexedDBAdapter } from "./indexeddb-adapter";

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

// Example 1: Auto-persisting store with reactive updates
export function createAutoPersistStore<T>(key: string, initialValue: T) {
  const [getStoredValue, setStoredValue] = createIndexedDBAdapter<T>(key);

  // Initialize with stored value or fallback to initial value
  const store = createStore(initialValue);

  // Load from IndexedDB when store is created
  getStoredValue().then((storedValue) => {
    if (storedValue !== undefined) {
      store.$set(storedValue);
    }
  });

  // Subscribe to store changes and auto-persist
  store.$act((newValue) => {
    setStoredValue(newValue);
  });

  return store;
}

// Example 2: Simple counter store with IndexedDB persistence
export async function createPersistedCounterStore() {
  const [getStoredCount, setStoredCount] =
    createIndexedDBAdapter<number>("counter");

  // Load initial state from IndexedDB
  const initialCount = (await getStoredCount()) ?? 0;

  // Create the store with initial state
  const counterStore = createStore({
    decrement: () => {
      const newValue = counterStore.value.$get() - 1;
      counterStore.value.$set(newValue);
      setStoredCount(newValue); // Persist to IndexedDB
    },
    increment: () => {
      const newValue = counterStore.value.$get() + 1;
      counterStore.value.$set(newValue);
      setStoredCount(newValue); // Persist to IndexedDB
    },
    reset: () => {
      counterStore.value.$set(0);
      setStoredCount(0); // Persist to IndexedDB
    },
    value: initialCount,
  });

  return counterStore;
}

// Example 3: Todo list store with IndexedDB persistence
export async function createPersistedTodoStore() {
  const [getStoredTodos, setStoredTodos] =
    createIndexedDBAdapter<Todo[]>("todos");

  // Load initial state from IndexedDB
  const initialTodos = (await getStoredTodos()) ?? [];

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
      setStoredTodos(updatedTodos); // Persist to IndexedDB
    },
    clearCompleted: () => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.filter((todo) => !todo.completed);

      todoStore.todos.$set(updatedTodos);
      setStoredTodos(updatedTodos); // Persist to IndexedDB
    },
    removeTodo: (id: string) => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.filter((todo) => todo.id !== id);

      todoStore.todos.$set(updatedTodos);
      setStoredTodos(updatedTodos); // Persist to IndexedDB
    },
    todos: initialTodos,
    toggleTodo: (id: string) => {
      const currentTodos = todoStore.todos.$get();
      const updatedTodos = currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );

      todoStore.todos.$set(updatedTodos);
      setStoredTodos(updatedTodos); // Persist to IndexedDB
    },
  });

  return todoStore;
}

// Example 4: User profile store with custom serialization
export async function createPersistedUserProfileStore() {
  const [getStoredProfile, setStoredProfile] =
    createIndexedDBAdapter<UserProfile>("userProfile", {
      // Custom serialization to handle Date objects
      deserialize: (profile) => ({
        ...profile,
        lastLogin: new Date(profile.lastLogin),
      }),
      serialize: (profile) => ({
        ...profile,
        lastLogin: profile.lastLogin.toISOString(),
      }),
    });

  // Load initial state from IndexedDB
  const initialProfile = await getStoredProfile();

  const profileStore = createStore({
    login: (profile: UserProfile) => {
      const loginProfile = { ...profile, lastLogin: new Date() };
      profileStore.profile.$set(loginProfile);
      setStoredProfile(loginProfile); // Persist to IndexedDB
    },
    logout: () => {
      profileStore.profile.$set(null as any); // Clear profile
      setStoredProfile(undefined); // Clear from IndexedDB
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
      setStoredProfile(updatedProfile); // Persist to IndexedDB
    },
    updateProfile: (updates: Partial<UserProfile>) => {
      const currentProfile = profileStore.profile.$get();
      if (!currentProfile) return;

      const updatedProfile = { ...currentProfile, ...updates };
      profileStore.profile.$set(updatedProfile);
      setStoredProfile(updatedProfile); // Persist to IndexedDB
    },
  });

  return profileStore;
}
