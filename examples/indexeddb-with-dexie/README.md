# Portal Store - IndexedDB with Dexie Example

A modern React application demonstrating Portal state management with IndexedDB persistence using Dexie.

## 🚀 Features

- **Counter Store**: Simple persistent counter with increment/decrement operations
- **Todo List**: CRUD operations with array state management and persistence
- **User Profile**: Complex object state with custom serialization for Date objects
- **Preferences**: Auto-persisting settings store with reactive updates

## 🛠️ Technologies

- **Portal Store** - State management library
- **IndexedDB** - Browser persistence layer
- **Dexie** - IndexedDB wrapper for easier usage
- **React** - UI framework with hooks
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main app layout with navigation
├── pages/
│   ├── Home.tsx           # Landing page with feature overview
│   ├── CounterExample.tsx # Persistent counter demo
│   ├── TodoExample.tsx    # Todo list with CRUD operations
│   ├── UserProfileExample.tsx # Complex object with Date serialization
│   └── PreferencesExample.tsx # Auto-persisting settings
├── App.tsx                # Main app component with routing
├── main.tsx              # React app entry point
└── index.css             # Tailwind CSS imports and custom styles
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

## 🔍 Running the Example

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

## 🏗️ Key Concepts Demonstrated

### 1. **Reactive State Management**

Portal's `$use` hook automatically subscribes components to state changes, providing real-time updates across the entire application.

### 2. **Persistent State**

All examples use IndexedDB through Dexie to persist state across browser sessions, demonstrating different patterns:

- Simple values (counter)
- Arrays (todo list)
- Complex objects (user profile)
- Auto-persistence (preferences)

### 3. **Custom Middleware**

The user profile example shows how to handle complex types like Date objects that need serialization for storage.

### 4. **Cross-tab Synchronization**

Open multiple tabs to see how state changes propagate across browser tabs in real-time.

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

## 🔧 Development

### Prerequisites

- Node.js 16+
- pnpm (or npm/yarn)

### Browser Support

IndexedDB is supported in all modern browsers:

- Chrome 24+
- Firefox 16+
- Safari 8+
- Edge 12+
- Mobile browsers
-

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development Tips

1. **Inspect Persisted Data**:
   Open DevTools → Application → Storage → IndexedDB → PortalStore

2. **Monitor State Changes**:
   Check the browser console for Portal store activity

3. **Test Cross-tab Sync**:
   Open multiple tabs and observe real-time state synchronization

## 🎨 UI Design

The application uses a modern, responsive design with:

- Gradient backgrounds and smooth animations
- Card-based layout for clear content separation
- Mobile-first responsive navigation
- Tailwind CSS custom color palette
- Accessibility-focused design patterns

## 🛠️ Customization

### Different Database Names

```typescript
const adapter = createIndexedDBAdapter("myKey", {
  databaseName: "MyCustomDB",
});
```

### Custom Middleware

```typescript
const adapter = createIndexedDBAdapter("myKey", {
  beforeStorage: (value) => {
    if (value instanceof Date) {
      return value.toISOString(); // Serialize Date to string
    }
    return value; // Default serialization
  },
  beforeUsage: (value) => {
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return new Date(value); // Deserialize string back to Date
    }
    return value; // Default deserialization
  },
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

## 📚 Code Examples

Each page demonstrates different Portal patterns:

- **Counter**: Basic reactive state with persistence
- **Todo List**: Array manipulation and CRUD operations
- **User Profile**: Complex object state with type transforms
- **Preferences**: Auto-persisting settings with immediate sync

Browse the source code to see practical implementations of these patterns in real-world scenarios.

## 📝 Best Practices

1. **Always Handle Async Operations**: IndexedDB operations are asynchronous
2. **Provide Fallback Values**: Use `defaultValue` when loading state
3. **Custom Middleware**: Handle Date objects and other complex types
4. **Error Boundaries**: Wrap IndexedDB operations in try-catch blocks
5. **Database Versioning**: Plan for schema changes in production apps

## 🔗 Learning Resources

- [Portal Documentation](../../README.md) - Main Portal library docs
- [Dexie Documentation](https://dexie.org/) - IndexedDB wrapper
- [React Documentation](https://react.dev/) - React fundamentals
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [IndexedDB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - MDN IndexedDB API
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language
- [React Router Documentation](https://reactrouter.com/) - Client-side routing
- [Vite Documentation](https://vitejs.dev/) - Fast build tool

## 🤝 Contributing

Feel free to improve these examples or add new ones! Some ideas:

- Real-time sync with server
- Offline queue management
- Data migration examples
- Performance optimization patterns

---

**Happy coding!** 🎉

This example shows how powerful the combination of Portal stores + IndexedDB + Dexie can be for building robust, offline-capable applications with persistent state management.
