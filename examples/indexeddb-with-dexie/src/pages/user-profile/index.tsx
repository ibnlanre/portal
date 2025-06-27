import { useState } from "react";
import { profileStore, type UserProfile } from "./store";

export function UserProfile() {
  const [loginForm, setLoginForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [profile] = profileStore.profile.$use();

  const handleLogin = () => {
    if (loginForm.name.trim() && loginForm.email.trim()) {
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

      profileStore.login(newProfile);
      setLoginForm({ name: "", email: "", avatar: "" });
    }
  };

  const toggleTheme = () => {
    if (profileStore && profile) {
      const newTheme = profile.preferences.theme === "light" ? "dark" : "light";
      profileStore.updatePreferences({ theme: newTheme });
    }
  };

  const toggleNotifications = () => {
    if (profile) {
      profileStore.updatePreferences({
        notifications: !profile.preferences.notifications,
      });
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-portal-blue-500" />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          User Profile Example
        </h1>
        <p className="text-lg text-gray-600">
          User authentication with persistent profile data and preferences
        </p>
      </div>

      {!profile ? (
        <div className="max-w-md mx-auto card">
          <h2 className="mb-4 text-xl font-semibold">Login</h2>
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
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="max-w-2xl mx-auto card">
            <div className="flex items-center mb-6 space-x-4">
              {profile.avatar ? (
                <img
                  alt={`${profile.name}'s avatar`}
                  className="object-cover w-16 h-16 rounded-full"
                  src={profile.avatar}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 text-xl font-semibold text-white rounded-full bg-portal-blue-500">
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

            <div className="pt-6 border-t">
              <h3 className="mb-4 text-lg font-medium">Preferences</h3>
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

            <div className="pt-6 mt-6 border-t">
              <button
                className="btn-danger"
                type="button"
                onClick={() => profileStore.logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto border-purple-200 card bg-purple-50">
        <h3 className="mb-2 font-semibold text-purple-900">Features:</h3>
        <ul className="space-y-1 text-sm text-purple-800">
          <li>• Persistent user authentication state</li>
          <li>• Custom date serialization for IndexedDB storage</li>
          <li>• Live preference updates with immediate UI feedback</li>
          <li>• Secure logout with complete data clearing</li>
          <li>• Automatic profile restoration on page reload</li>
        </ul>
      </div>
    </div>
  );
}
