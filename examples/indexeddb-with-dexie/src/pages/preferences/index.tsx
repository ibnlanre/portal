import { preferencesStore } from "./store";

export function Preferences() {
  const [preferences] = preferencesStore.$use();

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-blue-500" />
  //     </div>
  //   );
  // }

  if (!preferences) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Preferences Example
        </h1>
        <p className="text-lg text-gray-600">
          Auto-persisting application preferences with nested object support
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="autoSave">
                Auto Save
              </label>
              <input
                checked={preferences.autoSave}
                id="autoSave"
                onChange={(e) => preferencesStore.update("autoSave", e.target.checked)}
                type="checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="language">
                Language
              </label>
              <select
                id="language"
                onChange={(e) => preferencesStore.update("language", e.target.value)}
                value={preferences.language}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="theme">
                Theme
              </label>
              <select
                id="theme"
                onChange={(e) =>
                  preferencesStore.update("theme", e.target.value as any)
                }
                value={preferences.theme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="emailNotifications">
                Email Notifications
              </label>
              <input
                checked={preferences.notifications.email}
                id="emailNotifications"
                onChange={(e) =>
                  preferencesStore.update("notifications.email", e.target.checked)
                }
                type="checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="pushNotifications">
                Push Notifications
              </label>
              <input
                checked={preferences.notifications.push}
                id="pushNotifications"
                onChange={(e) =>
                  preferencesStore.update("notifications.push", e.target.checked)
                }
                type="checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="desktopNotifications">
                Desktop Notifications
              </label>
              <input
                checked={preferences.notifications.desktop}
                id="desktopNotifications"
                onChange={(e) =>
                  preferencesStore.update("notifications.desktop", e.target.checked)
                }
                type="checkbox"
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Layout</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="sidebar">
                Show Sidebar
              </label>
              <input
                checked={preferences.layout.sidebar}
                id="sidebar"
                onChange={(e) =>
                  preferencesStore.update("layout.sidebar", e.target.checked)
                }
                type="checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700" htmlFor="compactMode">
                Compact Mode
              </label>
              <input
                checked={preferences.layout.compactMode}
                id="compactMode"
                onChange={(e) =>
                  preferencesStore.update("layout.compactMode", e.target.checked)
                }
                type="checkbox"
              />
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card bg-indigo-50 border-indigo-200 max-w-4xl mx-auto">
        <h3 className="font-semibold text-indigo-900 mb-2">Features:</h3>
        <ul className="text-indigo-800 space-y-1 text-sm">
          <li>• Automatic persistence of all preference changes</li>
          <li>• Support for nested objects and complex data structures</li>
          <li>• Real-time UI updates without manual subscription management</li>
          <li>• Type-safe preference updates with Portal's reactive system</li>
          <li>• Instant synchronization across browser tabs</li>
        </ul>
      </div>
    </div>
  );
}
