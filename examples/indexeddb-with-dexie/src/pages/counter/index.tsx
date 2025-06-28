import { counterStore } from "./store";

export function Counter() {
  const [value] = counterStore.value.$use();

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-blue-500" />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Counter Example
        </h1>
        <p className="text-lg text-gray-600">
          A simple counter that persists its value to IndexedDB
        </p>
      </div>

      <div className="card max-w-md mx-auto text-center">
        <div className="text-6xl font-bold text-portal-blue-600 mb-6">
          {value}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="btn-secondary text-2xl size-12 justify-center items-center flex rounded-full"
            onClick={counterStore.decrement}
            type="button"
          >
            −
          </button>
          <button
            className="btn-primary text-2xl size-12 justify-center items-center flex rounded-full"
            onClick={counterStore.increment}
            type="button"
          >
            +
          </button>
        </div>

        <button
          className="btn-danger mt-4"
          onClick={counterStore.reset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Value is automatically saved to IndexedDB on every change</li>
          <li>• Reloading the page preserves the counter value</li>
          <li>• Multiple tabs share the same counter state</li>
          <li>• Portal's reactive system updates the UI instantly</li>
        </ul>
      </div>
    </div>
  );
}
