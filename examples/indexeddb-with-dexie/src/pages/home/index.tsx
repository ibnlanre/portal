export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Portal Store Examples
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore interactive examples of Portal state management with IndexedDB
          persistence using Dexie. These examples demonstrate real-world usage
          patterns and best practices.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Counter Store
          </h3>
          <p className="text-gray-600 text-sm">
            Simple persistent counter with increment/decrement operations
          </p>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Todo List
          </h3>
          <p className="text-gray-600 text-sm">
            CRUD operations with array state management and persistence
          </p>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl mb-3">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            User Profile
          </h3>
          <p className="text-gray-600 text-sm">
            Complex object state with custom serialization for Date objects
          </p>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Preferences
          </h3>
          <p className="text-gray-600 text-sm">
            Auto-persisting settings store with reactive updates
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">🔧</span>
            Technologies Used
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>
              • <strong>Portal Store</strong> - State management
            </li>
            <li>
              • <strong>IndexedDB</strong> - Browser persistence
            </li>
            <li>
              • <strong>Dexie</strong> - IndexedDB wrapper
            </li>
            <li>
              • <strong>React</strong> - UI framework
            </li>
            <li>
              • <strong>Tailwind CSS</strong> - Styling
            </li>
            <li>
              • <strong>Vite</strong> - Build tool
            </li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Key Features
          </h3>
          <ul className="space-y-2 text-purple-800">
            <li>
              • <strong>Reactive Updates</strong> - Real-time UI synchronization
            </li>
            <li>
              • <strong>Persistent State</strong> - Survives browser restarts
            </li>
            <li>
              • <strong>Type Safety</strong> - Full TypeScript support
            </li>
            <li>
              • <strong>Custom Transforms</strong> - Serialize complex types
            </li>
            <li>
              • <strong>Cross-tab Sync</strong> - State shared between tabs
            </li>
            <li>
              • <strong>Error Handling</strong> - Graceful failure recovery
            </li>
          </ul>
        </div>
      </div>

      {/* Developer Tips */}
      <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
          <span className="mr-2">🛠️</span>
          Developer Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-yellow-800">
          <div>
            <p className="font-medium mb-2">Inspect Persisted Data:</p>
            <p className="text-sm">
              Open DevTools → Application → Storage → IndexedDB → PortalStore
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Test Cross-tab Sync:</p>
            <p className="text-sm">
              Open multiple tabs and watch state synchronize in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
