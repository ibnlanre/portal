import type { PropsWithChildren } from "react";

import { Link, useLocation } from "react-router-dom";

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation();

  const navItems = [
    { icon: "🏠", label: "Home", path: "/" },
    { icon: "📊", label: "Counter", path: "/counter" },
    { icon: "✅", label: "Todos", path: "/todos" },
    { icon: "👤", label: "Profile", path: "/profile" },
    { icon: "⚙️", label: "Preferences", path: "/preferences" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🗄️</div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-portal-blue-600 to-portal-purple-600 bg-clip-text">
                  Portal Store
                </h1>
                <p className="text-sm text-gray-500">
                  IndexedDB + Dexie Examples
                </p>
              </div>
            </div>

            <nav className="hidden space-x-1 md:flex">
              {navItems.map((item) => (
                <Link
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-portal-blue-50 text-portal-blue-700 border border-portal-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  key={item.path}
                  to={item.path}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="bg-white border-b border-gray-100 md:hidden">
        <div className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-portal-blue-50 text-portal-blue-700 border border-portal-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                key={item.path}
                to={item.path}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-100">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-500">
              Built with{" "}
              <span className="font-semibold text-portal-blue-600">Portal</span>
              , <span className="font-semibold text-purple-600">React</span>,
              and{" "}
              <span className="font-semibold text-indigo-600">
                Tailwind CSS
              </span>
            </div>
            <div className="text-sm text-gray-500">
              💾 Data persisted with IndexedDB & Dexie
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
