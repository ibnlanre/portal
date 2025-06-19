import {
  createAutoPersistStore,
  createPersistedCounterStore,
  createPersistedTodoStore,
  createPersistedUserProfileStore,
  type UserProfile,
} from "./store-examples";

/**
 * Example usage of IndexedDB-persisted stores
 */
async function main() {
  console.log("🚀 Starting IndexedDB with Dexie examples...");

  // Example 1: Counter Store
  console.log("\n📊 Counter Store Example");
  const counterStore = await createPersistedCounterStore();

  console.log("Initial counter value:", counterStore.value.$get());

  // Increment counter
  counterStore.increment();
  console.log("After increment:", counterStore.value.$get());

  // Subscribe to changes
  const unsubscribeCounter = counterStore.$act((state) => {
    console.log("Counter store updated:", state);
  });

  // Example 2: Todo Store
  console.log("\n✅ Todo Store Example");
  const todoStore = await createPersistedTodoStore();

  console.log("Initial todos:", todoStore.todos.$get());

  // Add a todo
  todoStore.addTodo("Learn IndexedDB with Portal");
  todoStore.addTodo("Build amazing apps");

  console.log("After adding todos:", todoStore.todos.$get());

  // Toggle first todo
  const todos = todoStore.todos.$get();
  if (todos.length > 0) {
    todoStore.toggleTodo(todos[0]!.id);
    console.log("After toggling first todo:", todoStore.todos.$get());
  }

  // Example 3: User Profile Store with custom serialization
  console.log("\n👤 User Profile Store Example");
  const profileStore = await createPersistedUserProfileStore();

  // Login with a user profile
  const sampleProfile: UserProfile = {
    avatar: "https://example.com/avatar.jpg",
    email: "user@example.com",
    lastLogin: new Date(),
    name: "John Doe",
    preferences: {
      notifications: true,
      theme: "dark",
    },
  };

  profileStore.login(sampleProfile);
  console.log("After login:", profileStore.profile.$get());

  // Update preferences
  profileStore.updatePreferences({ theme: "light" });
  console.log("After preference update:", profileStore.profile.$get());

  // Example 4: Auto-persisting store
  console.log("\n⚙️ Auto-persist Store Example");
  const settingsStore = createAutoPersistStore("app-settings", {
    language: "en",
    notifications: true,
    theme: "light",
  });

  console.log("Initial settings:", settingsStore.$get());

  // Update settings - automatically persisted
  settingsStore.$set((prev) => ({ ...prev, language: "es", theme: "dark" }));
  console.log("After update:", settingsStore.$get());

  // Cleanup
  setTimeout(() => {
    unsubscribeCounter();
    console.log("\n✅ All examples completed!");
    console.log(
      "Check your browser's IndexedDB (DevTools > Application > Storage > IndexedDB) to see the persisted data."
    );
  }, 1000);
}

// Run examples if this file is executed directly
if (typeof window !== "undefined") {
  // Browser environment
  main().catch(console.error);
} else {
  // Node.js environment
  console.log(
    "This example is designed to run in a browser environment with IndexedDB support."
  );
  console.log("Please run: npm run dev");
}

export { main };
