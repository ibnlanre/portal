import type { UserProfile } from "../../../store-examples";

import React from "react";

import { createPersistedUserProfileStore } from "../../../store-examples";

const UserProfileExample: React.FC = () => {
  const [userStore, setUserStore] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [loginForm, setLoginForm] = React.useState({
    name: "",
    email: "",
    avatar: "",
  });

  React.useEffect(() => {
    createPersistedUserProfileStore().then((store) => {
      setUserStore(store);
      setLoading(false);
    });
  }, []);

  const [profile] = userStore?.profile?.$use() ?? [null];

  const handleLogin = () => {
    if (loginForm.name.trim() && loginForm.email.trim() && userStore) {
      const newProfile: UserProfile = {
        name: loginForm.name.trim(),
        email: loginForm.email.trim(),
        avatar: loginForm.avatar.trim() || undefined,
        lastLogin: new Date(),
        preferences: {
          theme: "light",
          notifications: true,
        },
      };
      
      userStore.login(newProfile);
      setLoginForm({ name: "", email: "", avatar: "" });
    }
  };

  const toggleTheme = () => {
    if (userStore && profile) {
      const newTheme = profile.preferences.theme === "light" ? "dark" : "light";
      userStore.updatePreferences({ theme: newTheme });
    }
  };

  const toggleNotifications = () => {
    if (userStore && profile) {
      userStore.updatePreferences({
        notifications: !profile.preferences.notifications,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          User Profile Example
        </h1>
        <p className="text-lg text-gray-600">
          User authentication with persistent profile data and preferences
        </p>
      </div>

      {!profile ? (
        <div className="card max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-blue-500 focus:border-transparent"
              placeholder="Full Name"
              type="text"
              value={loginForm.name}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-blue-500 focus:border-transparent"
              placeholder="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-blue-500 focus:border-transparent"
              placeholder="Avatar URL (optional)"
              type="url"
              value={loginForm.avatar}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, avatar: e.target.value }))
              }
            />
            <button
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!loginForm.name.trim() || !loginForm.email.trim()}
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              {profile.avatar ? (
                <img
                  alt={`${profile.name}'s avatar`}
                  className="w-16 h-16 rounded-full object-cover"
                  src={profile.avatar}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-portal-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.name}
                </h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500">
                  Last login: {profile.lastLogin.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Theme</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                      profile.preferences.theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    type="button"
                    onClick={toggleTheme}
                  >
                    {profile.preferences.theme === "dark" ? "Dark" : "Light"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Notifications</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                      profile.preferences.notifications
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                    type="button"
                    onClick={toggleNotifications}
                  >
                    {profile.preferences.notifications ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <button
                className="btn-danger"
                type="button"
                onClick={() => userStore?.logout()}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-purple-50 border-purple-200 max-w-2xl mx-auto">
        <h3 className="font-semibold text-purple-900 mb-2">Features:</h3>
        <ul className="text-purple-800 space-y-1 text-sm">
          <li>• Persistent user authentication state</li>
          <li>• Custom date serialization for IndexedDB storage</li>
          <li>• Live preference updates with immediate UI feedback</li>
          <li>• Secure logout with complete data clearing</li>
          <li>• Automatic profile restoration on page reload</li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileExample;
