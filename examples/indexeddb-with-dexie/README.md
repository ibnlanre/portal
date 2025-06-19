# IndexedDB with Dexie - Portal Store Example

This example demonstrates how to persist state data with IndexedDB using the createStore from @ibnlanre/portal and Dexie as the IndexedDB wrapper library.

## 🏗️ Project Structure

```
examples/indexeddb-with-dexie/
├── package.json          # Project dependencies (Dexie, Vite, TypeScript)
├── indexeddb-adapter.ts   # IndexedDB adapter using Dexie
├── store-examples.ts      # Store examples with IndexedDB persistence
├── demo.html             # Interactive demo page
├── README.md             # This file
└── tsconfig.json         # TypeScript configuration
```

## 📦 Installation

1. Navigate to the example directory:

```bash
cd examples/indexeddb-with-dexie
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 🚀 Running the Example

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### View the Demo

Open `demo.html` in your browser to see an interactive demo of all the examples.

## 📚 What's Included

### 1. IndexedDB Adapter (`indexeddb-adapter.ts`)

A reusable adapter that provides:

- **Database Setup**: Creates and manages an IndexedDB database using Dexie
- **Generic Interface**: Works with any data type
- **Serialization Support**: Custom serialize/deserialize functions for complex data types
- **Error Handling**: Graceful error handling for database operations

Key features:

- Stores data with timestamps for audit trails
- Supports custom serialization (useful for Date objects, etc.)
- Simple API: `[getState, setState, clearState]`

### 2. Store Examples (`store-examples.ts`)

Four comprehensive examples showing different patterns:

#### Example 1: Simple Counter Store

```typescript
const counterStore = await createPersistedCounterStore();
counterStore.increment(); // Auto-persists to IndexedDB
```

Features:

- Simple number value persistence
- Methods for increment, decrement, reset
- Immediate persistence on state changes

#### Example 2: Todo List Store

```typescript
const todoStore = await createPersistedTodoStore();
todoStore.addTodo("Learn IndexedDB"); // Auto-persists to IndexedDB
```

Features:

- Array of complex objects
- CRUD operations (Create, Read, Update, Delete)
- Filtering operations (clear completed)

#### Example 3: User Profile Store with Custom Serialization

```typescript
const profileStore = await createPersistedUserProfileStore();
profileStore.login(userProfile); // Handles Date serialization automatically
```

Features:

- Custom serialization for Date objects
- Nested object structure
- Complex state management

#### Example 4: Auto-Persisting Store

```typescript
const settingsStore = createAutoPersistStore("settings", { theme: "light" });
settingsStore.$set({ theme: "dark" }); // Automatically persisted
```

Features:

- Reactive persistence (saves on every change)
- Generic implementation
- Minimal setup required

### 3. Interactive Demo (`demo.html`)

A complete HTML demo showcasing:

- Live counter with persistence
- Interactive todo list
- Settings that auto-save
- Database management tools

## 🔧 Key Concepts

### IndexedDB Adapter Pattern

The adapter pattern separates storage concerns from business logic:

```typescript
// Create adapter
const [getStoredData, setStoredData] = createIndexedDBAdapter<MyData>("myKey");

// Load initial state
const initialData = (await getStoredData()) ?? defaultData;

// Create store with initial state
const store = createStore({
  data: initialData,
  updateData: (newData) => {
    store.data.$set(newData);
    setStoredData(newData); // Persist to IndexedDB
  },
});
```

### Custom Serialization

Handle complex data types with custom serialization:

```typescript
const adapter = createIndexedDBAdapter<UserProfile>("profile", {
  serialize: (profile) => ({
    ...profile,
    lastLogin: profile.lastLogin.toISOString(), // Date → string
  }),
  deserialize: (profile) => ({
    ...profile,
    lastLogin: new Date(profile.lastLogin), // string → Date
  }),
});
```

### Reactive Persistence

Use `$act` to automatically persist state changes:

```typescript
store.$act((newState) => {
  persistToIndexedDB(newState);
});
```

## 🎯 Benefits

### 1. **Offline-First Applications**

- Data persists across browser sessions
- Works without network connectivity
- Large storage capacity (much more than localStorage)

### 2. **Type Safety**

- Full TypeScript support
- Generic adapters work with any data type
- Compile-time error checking

### 3. **Performance**

- Asynchronous operations don't block UI
- Efficient for large datasets
- IndexedDB is optimized for client-side storage

### 4. **Flexibility**

- Custom serialization for complex data types
- Multiple databases and object stores
- Transaction support for data integrity

## 🔍 Browser Support

IndexedDB is supported in all modern browsers:

- Chrome 24+
- Firefox 16+
- Safari 8+
- Edge 12+
- Mobile browsers

## 🛠️ Customization

### Different Database Names

```typescript
const adapter = createIndexedDBAdapter("myKey", {
  databaseName: "MyCustomDB",
});
```

### Custom Serialization

```typescript
const adapter = createIndexedDBAdapter("myKey", {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});
```

### Error Handling

```typescript
const [getState, setState] = createIndexedDBAdapter("myKey");

try {
  const data = await getState();
  // Handle data
} catch (error) {
  console.error("Failed to load from IndexedDB:", error);
  // Fallback to default state
}
```

## 📝 Best Practices

1. **Always Handle Async Operations**: IndexedDB operations are asynchronous
2. **Provide Fallback Values**: Use `|| defaultValue` when loading state
3. **Custom Serialization**: Handle Date objects and other complex types
4. **Error Boundaries**: Wrap IndexedDB operations in try-catch blocks
5. **Database Versioning**: Plan for schema changes in production apps

## 🔗 Related Resources

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [@ibnlanre/portal Documentation](../../README.md)

## 🤝 Contributing

Feel free to improve these examples or add new ones! Some ideas:

- Real-time sync with server
- Offline queue management
- Data migration examples
- Performance optimization patterns

---

**Happy coding!** 🎉

This example shows how powerful the combination of createStore + IndexedDB + Dexie can be for building robust, offline-capable applications with persistent state management.
