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

## 🎯 Key Concepts Demonstrated

### 1. **Reactive State Management**

Portal's `$use` hook automatically subscribes components to state changes, providing real-time updates across the entire application.

### 2. **Persistent State**

All examples use IndexedDB through Dexie to persist state across browser sessions, demonstrating different patterns:

- Simple values (counter)
- Arrays (todo list)
- Complex objects (user profile)
- Auto-persistence (preferences)

### 3. **Custom Serialization**

The user profile example shows how to handle complex types like Date objects that need custom serialization for storage.

### 4. **Cross-tab Synchronization**

Open multiple tabs to see how state changes propagate across browser tabs in real-time.

## 🔧 Development

### Prerequisites

- Node.js 16+
- pnpm (or npm/yarn)

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

## 📚 Learning Resources

- [Portal Documentation](../../README.md) - Main Portal library docs
- [Dexie Documentation](https://dexie.org/) - IndexedDB wrapper
- [React Documentation](https://react.dev/) - React fundamentals
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 🔍 Code Examples

Each page demonstrates different Portal patterns:

- **Counter**: Basic reactive state with persistence
- **Todo List**: Array manipulation and CRUD operations
- **User Profile**: Complex object state with type transforms
- **Preferences**: Auto-persisting settings with immediate sync

Browse the source code to see practical implementations of these patterns in real-world scenarios.
