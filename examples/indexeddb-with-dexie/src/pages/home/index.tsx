import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  const handleClearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      try {
        // Clear IndexedDB using the same method as demo.html
        const dbName = "PortalStore";
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
          alert(
            "All data cleared! Navigating to refresh the application state."
          );
          // Navigate to home to refresh the app state
          navigate("/", { replace: true });
          // Force a hard refresh to ensure all stores are reinitialized
          setTimeout(() => navigate(0), 100);
        };

        request.onerror = () => {
          alert("Error clearing database. Please try again.");
        };
      } catch (error) {
        console.error("Error clearing database:", error);
        alert("Error clearing database. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to Portal Store Examples
        </h1>
        <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600">
          Explore interactive examples of Portal state management with IndexedDB
          persistence using Dexie. These examples demonstrate real-world usage
          patterns and best practices.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="transition-shadow duration-200 card hover:shadow-lg">
          <div className="mb-3 text-3xl">📊</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Counter Store
          </h3>
          <p className="text-sm text-gray-600">
            Simple persistent counter with increment/decrement operations
          </p>
        </div>

        <div className="transition-shadow duration-200 card hover:shadow-lg">
          <div className="mb-3 text-3xl">✅</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Todo List
          </h3>
          <p className="text-sm text-gray-600">
            CRUD operations with array state management and persistence
          </p>
        </div>

        <div className="transition-shadow duration-200 card hover:shadow-lg">
          <div className="mb-3 text-3xl">👤</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            User Profile
          </h3>
          <p className="text-sm text-gray-600">
            Complex object state with custom serialization for Date objects
          </p>
        </div>

        <div className="transition-shadow duration-200 card hover:shadow-lg">
          <div className="mb-3 text-3xl">⚙️</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Preferences
          </h3>
          <p className="text-sm text-gray-600">
            Auto-persisting settings store with reactive updates
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 mt-12 md:grid-cols-2">
        <div className="border-blue-200 card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="flex items-center mb-3 text-lg font-semibold text-blue-900">
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

        <div className="border-purple-200 card bg-gradient-to-br from-purple-50 to-purple-100">
          <h3 className="flex items-center mb-3 text-lg font-semibold text-purple-900">
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
      <div className="border-yellow-200 card bg-gradient-to-br from-yellow-50 to-orange-50">
        <h3 className="flex items-center mb-3 text-lg font-semibold text-yellow-900">
          <span className="mr-2">🛠️</span>
          Developer Tips
        </h3>
        <div className="grid gap-4 text-yellow-800 md:grid-cols-2">
          <div>
            <p className="mb-2 font-medium">Inspect Persisted Data:</p>
            <p className="text-sm">
              Open DevTools → Application → Storage → IndexedDB → PortalStore
            </p>
          </div>
          <div>
            <p className="mb-2 font-medium">Test Cross-tab Sync:</p>
            <p className="text-sm">
              Open multiple tabs and watch state synchronize in real-time
            </p>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="border-red-200 card bg-gradient-to-br from-red-50 to-red-100">
        <h3 className="flex items-center mb-3 text-lg font-semibold text-red-900">
          <span className="mr-2">💾</span>
          Database Management
        </h3>
        <div className="space-y-4 text-red-800">
          <div>
            <p className="mb-2 font-medium">
              IndexedDB Database:{" "}
              <code className="px-2 py-1 text-sm bg-red-200 rounded">
                PortalStore
              </code>
            </p>
            <p className="mb-3 text-sm">Stores:</p>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • <code className="px-1 bg-red-200 rounded">counter</code> -
                Simple number value
              </li>
              <li>
                • <code className="px-1 bg-red-200 rounded">todos</code> - Array
                of todo objects
              </li>
              <li>
                • <code className="px-1 bg-red-200 rounded">preferences</code> -
                User preferences object
              </li>
              <li>
                • <code className="px-1 bg-red-200 rounded">userProfile</code> -
                User profile with complex data
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-red-200">
            <button
              onClick={handleClearAllData}
              className="px-4 py-2 font-medium text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700"
            >
              Clear All Data
            </button>
            <p className="mt-2 text-xs text-red-700">
              ⚠️ This will permanently delete all stored data and reload the
              page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
