import { fireEvent, render, screen } from "@testing-library/react";
import { Fragment } from "react";
import { describe, expect, it, vi } from "vitest";

import { createContextStore } from "./index";
import { combine, createStore } from "@/index";

describe("createContextStore", () => {
  describe("Basic functionality", () => {
    it("should create a provider and useStore hook", () => {
      const [Provider, useStore] = createContextStore(
        (context: { value: string }) => createStore(context)
      );

      expect(Provider).toBeDefined();
      expect(useStore).toBeDefined();
      expect(typeof Provider).toBe("function");
      expect(typeof useStore).toBe("function");
    });

    it("should throw error when useStore is called outside provider", () => {
      const [, useStore] = createContextStore((context: { value: string }) => {
        return createStore(context.value);
      });

      function TestComponent() {
        useStore();
        return <div>Test</div>;
      }

      expect(() => render(<TestComponent />)).toThrow(
        "useStore must be used within a StoreProvider"
      );
    });

    it("should provide store through context when wrapped in provider", () => {
      const [Provider, useStore] = createContextStore(
        (context: { value: string }) => createStore(context.value)
      );

      function TestComponent() {
        const store = useStore();
        const value = store.$get();
        return <div data-testid="value">{value}</div>;
      }

      render(
        <Provider value={{ value: "test" }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("value")).toHaveTextContent("test");
    });
  });

  describe("Store initialization with context", () => {
    it("should initialize store with context value", () => {
      const [Provider, useStore] = createContextStore(
        (context: { count: number }) => createStore(context.count)
      );

      function TestComponent() {
        const store = useStore();
        const count = store.$get();
        return <div data-testid="count">{count}</div>;
      }

      render(
        <Provider value={{ count: 42 }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("count")).toHaveTextContent("42");
    });

    it("should reinitialize store when context value changes", () => {
      const [Provider, useStore] = createContextStore(
        (context: { count: number }) => createStore(context.count)
      );

      function TestComponent() {
        const store = useStore();
        const count = store.$get();
        return <div data-testid="count">{count}</div>;
      }

      const { rerender } = render(
        <Provider value={{ count: 10 }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("count")).toHaveTextContent("10");

      rerender(
        <Provider value={{ count: 20 }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("count")).toHaveTextContent("20");
    });
  });

  describe("Complex store scenarios", () => {
    it("should work with stores that combine state and actions", () => {
      const [CountProvider, useCountStore] = createContextStore(
        (context: { initialCount: number }) => {
          const actions = {
            decrement: () => {
              store.count.$set((prev) => prev - 1);
            },
            increment: () => {
              store.count.$set((prev) => prev + 1);
            },
            reset: () => {
              store.count.$set(context.initialCount);
            },
          };

          const store = createStore(
            combine({ count: context.initialCount }, actions)
          );
          return store;
        }
      );

      function Counter() {
        const store = useCountStore();
        const [count] = store.count.$use();

        return (
          <div>
            <span data-testid="count">{count}</span>
            <button
              data-testid="increment"
              onClick={store.increment}
              type="button"
            >
              +
            </button>
            <button
              data-testid="decrement"
              onClick={store.decrement}
              type="button"
            >
              -
            </button>
            <button data-testid="reset" onClick={store.reset} type="button">
              Reset
            </button>
          </div>
        );
      }

      render(
        <CountProvider value={{ initialCount: 5 }}>
          <Counter />
        </CountProvider>
      );

      expect(screen.getByTestId("count")).toHaveTextContent("5");

      fireEvent.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("6");

      fireEvent.click(screen.getByTestId("decrement"));
      expect(screen.getByTestId("count")).toHaveTextContent("5");

      fireEvent.click(screen.getByTestId("increment"));
      fireEvent.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("7");

      fireEvent.click(screen.getByTestId("reset"));
      expect(screen.getByTestId("count")).toHaveTextContent("5");
    });

    it("should work with nested store structures", () => {
      type UserContext = {
        user: {
          email: string;
          name: string;
          preferences: {
            notifications: boolean;
            theme: "dark" | "light";
          };
        };
      };

      const [UserProvider, useUserStore] = createContextStore(
        (context: UserContext) => createStore(context)
      );

      function UserProfile() {
        const store = useUserStore();
        const user = store.user.$get();

        return (
          <div>
            <div data-testid="name">{user.name}</div>
            <div data-testid="email">{user.email}</div>
            <div data-testid="theme">{user.preferences.theme}</div>
            <div data-testid="notifications">
              {user.preferences.notifications.toString()}
            </div>
          </div>
        );
      }

      const userContext: UserContext = {
        user: {
          email: "john@example.com",
          name: "John Doe",
          preferences: {
            notifications: true,
            theme: "dark",
          },
        },
      };

      render(
        <UserProvider value={userContext}>
          <UserProfile />
        </UserProvider>
      );

      expect(screen.getByTestId("name")).toHaveTextContent("John Doe");
      expect(screen.getByTestId("email")).toHaveTextContent("john@example.com");
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("notifications")).toHaveTextContent("true");
    });
  });

  describe("Multiple providers", () => {
    it("should support multiple independent providers", () => {
      const [ValueProvider, useValueStore] = createContextStore(
        (context: { value: string }) => createStore(context.value)
      );
      const [CountProvider, useCountStore] = createContextStore(
        (context: { count: number }) => createStore(context.count)
      );

      function TestComponent() {
        const valueStore = useValueStore();
        const countStore = useCountStore();

        const value = valueStore.$get();
        const count = countStore.$get();

        return (
          <div>
            <div data-testid="value">{value}</div>
            <div data-testid="count">{count}</div>
          </div>
        );
      }

      render(
        <ValueProvider value={{ value: "hello" }}>
          <CountProvider value={{ count: 123 }}>
            <TestComponent />
          </CountProvider>
        </ValueProvider>
      );

      expect(screen.getByTestId("value")).toHaveTextContent("hello");
      expect(screen.getByTestId("count")).toHaveTextContent("123");
    });

    it("should support nested providers of the same type", () => {
      const [LevelProvider, useLevelStore] = createContextStore(
        (context: { level: number }) => createStore(context.level)
      );

      function InnerComponent() {
        const store = useLevelStore();
        const level = store.$get();

        return <div data-testid="inner-level">{level}</div>;
      }

      function OuterComponent() {
        const store = useLevelStore();
        const level = store.$get();

        return (
          <Fragment>
            <div data-testid="outer-level">{level}</div>
            <LevelProvider value={{ level: 2 }}>
              <InnerComponent />
            </LevelProvider>
          </Fragment>
        );
      }

      render(
        <LevelProvider value={{ level: 1 }}>
          <OuterComponent />
        </LevelProvider>
      );

      expect(screen.getByTestId("outer-level")).toHaveTextContent("1");
      expect(screen.getByTestId("inner-level")).toHaveTextContent("2");
    });
  });

  describe("Store memoization", () => {
    it("should memoize store based on context value", () => {
      const initializerMock = vi.fn((context: { value: string }) => {
        return createStore(context.value);
      });
      const [Provider, useStore] = createContextStore(initializerMock);

      function TestComponent() {
        const store = useStore();
        const value = store.$get();
        return <div data-testid="value">{value}</div>;
      }

      const { rerender } = render(
        <Provider value={{ value: "test" }}>
          <TestComponent />
        </Provider>
      );

      expect(initializerMock).toHaveBeenCalledTimes(1);

      // Re-render with same value - should not call initializer again
      rerender(
        <Provider value={{ value: "test" }}>
          <TestComponent />
        </Provider>
      );

      expect(initializerMock).toHaveBeenCalledTimes(1);

      // Re-render with different value - should call initializer again
      rerender(
        <Provider value={{ value: "different" }}>
          <TestComponent />
        </Provider>
      );

      expect(initializerMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("TypeScript integration", () => {
    it("should maintain proper type inference", () => {
      type AppContext = {
        locale: string;
        theme: "dark" | "light";
      };

      const [AppProvider, useAppStore] = createContextStore(
        (context: AppContext) => {
          const actions = {
            setLocale: (locale: string) => {
              store.locale.$set(locale);
            },
            toggleTheme: () => {
              store.theme.$set((current) =>
                current === "light" ? "dark" : "light"
              );
            },
          };

          const store = createStore(combine(context, actions));
          return store;
        }
      );

      function App() {
        const store = useAppStore();

        const [theme] = store.theme.$use();
        const [locale] = store.locale.$use();

        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="locale">{locale}</div>
            <button
              data-testid="toggle-theme"
              onClick={store.toggleTheme}
              type="button"
            >
              Toggle Theme
            </button>
            <button
              data-testid="set-locale"
              onClick={() => store.setLocale("fr")}
              type="button"
            >
              Set French
            </button>
          </div>
        );
      }

      render(
        <AppProvider value={{ locale: "en", theme: "light" }}>
          <App />
        </AppProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(screen.getByTestId("locale")).toHaveTextContent("en");

      fireEvent.click(screen.getByTestId("toggle-theme"));
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");

      fireEvent.click(screen.getByTestId("set-locale"));
      expect(screen.getByTestId("locale")).toHaveTextContent("fr");
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined context values", () => {
      const [Provider, useStore] = createContextStore(
        (context: { value?: string }) => createStore(context.value)
      );

      function TestComponent() {
        const store = useStore();
        const value = store.$get((value = "undefined") => value);

        return <div data-testid="value">{value}</div>;
      }

      render(
        <Provider value={{ value: undefined }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("value")).toHaveTextContent("undefined");
    });

    it("should handle empty object context", () => {
      const [Provider, useStore] = createContextStore((context: {}) => {
        return createStore(context);
      });

      function TestComponent() {
        const store = useStore();
        const state = store.$get();

        return <div data-testid="state">{JSON.stringify(state)}</div>;
      }

      render(
        <Provider value={{}}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("state")).toHaveTextContent("{}");
    });
  });
});
