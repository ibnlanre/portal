import { render, screen, waitFor } from "@testing-library/react";
import { Fragment } from "react";
import { describe, expect, it, vi } from "vitest";

import { createContextScope } from "./index";
import { createStore } from "@/create-store";
import { combine } from "@/create-store/functions/helpers/combine";
import { useAsync } from "@/create-store/functions/hooks/use-async";
import { ErrorBoundary, setup } from "@/vitest.react";

describe("createContextScope", () => {
  describe("Basic functionality", () => {
    it("should create a provider and useScope hook", () => {
      const [Provider, useScope] = createContextScope(
        (context: { value: string }) => createStore(context)
      );

      expect(Provider).toBeDefined();
      expect(useScope).toBeDefined();

      expect(typeof Provider).toBe("function");
      expect(typeof useScope).toBe("function");
    });

    it("should throw error when useScope is called outside provider", () => {
      const [, useScope] = createContextScope((context: { value: string }) => {
        return createStore(context.value);
      });

      function TestComponent() {
        useScope();
        return <div data-testid="test">Test</div>;
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("error").textContent).toBe(
        "Error: useScope must be used within a StoreProvider"
      );
    });

    it("should provide store through context when wrapped in provider", () => {
      const [Provider, useScope] = createContextScope(
        (context: { value: string }) => createStore(context.value)
      );

      function TestComponent() {
        const store = useScope();
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
      const [Provider, useScope] = createContextScope(
        (context: { count: number }) => createStore(context.count)
      );

      function TestComponent() {
        const store = useScope();
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
      const [Provider, useScope] = createContextScope(
        (context: { count: number }) => createStore(context.count)
      );

      function TestComponent() {
        const store = useScope();
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
    it("should work with stores that combine state and actions", async () => {
      const [CountProvider, useCountStore] = createContextScope(
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

      const { user } = setup(
        <CountProvider value={{ initialCount: 5 }}>
          <Counter />
        </CountProvider>
      );

      expect(screen.getByTestId("count")).toHaveTextContent("5");

      await user.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("6");

      await user.click(screen.getByTestId("decrement"));
      expect(screen.getByTestId("count")).toHaveTextContent("5");

      await user.click(screen.getByTestId("increment"));
      await user.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("7");

      await user.click(screen.getByTestId("reset"));
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

      const [UserProvider, useUserStore] = createContextScope(
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
      const [ValueProvider, useValueStore] = createContextScope(
        (context: { value: string }) => createStore(context.value)
      );
      const [CountProvider, useCountStore] = createContextScope(
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
      const [LevelProvider, useLevelScope] = createContextScope(
        (context: { level: number }) => createStore(context.level)
      );

      function InnerComponent() {
        const store = useLevelScope();
        const level = store.$get();

        return <div data-testid="inner-level">{level}</div>;
      }

      function OuterComponent() {
        const store = useLevelScope();
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
      const [Provider, useScope] = createContextScope(initializerMock);

      function TestComponent() {
        const store = useScope();
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
    it("should maintain proper type inference", async () => {
      type AppContext = {
        locale: string;
        theme: "dark" | "light";
      };

      const [AppProvider, useAppScope] = createContextScope(
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
        const store = useAppScope();

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

      const { user } = setup(
        <AppProvider value={{ locale: "en", theme: "light" }}>
          <App />
        </AppProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(screen.getByTestId("locale")).toHaveTextContent("en");

      await user.click(screen.getByTestId("toggle-theme"));
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");

      await user.click(screen.getByTestId("set-locale"));
      expect(screen.getByTestId("locale")).toHaveTextContent("fr");
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined context values", () => {
      const [Provider, useScope] = createContextScope(
        (context: { value?: string }) => createStore(context.value)
      );

      function TestComponent() {
        const store = useScope();
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
      const [Provider, useScope] = createContextScope((context: {}) => {
        return createStore(context);
      });

      function TestComponent() {
        const store = useScope();
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

  describe("Asynchronous logic", () => {
    it("should work with useAsync in store actions", async () => {
      const [Provider, useScope] = createContextScope(
        (context: { baseUrl: string }) => {
          const actions = {
            loadData: () => {
              const { data, error, isLoading } = useAsync(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                return { message: `Data from ${context.baseUrl}` };
              });

              return { data, error, isLoading };
            },
          };

          return createStore(combine({ baseUrl: context.baseUrl }, actions));
        }
      );

      function TestComponent() {
        const store = useScope();
        const { data, error, isLoading } = store.loadData();

        if (isLoading) return <div data-testid="loading">Loading...</div>;
        if (error) return <div data-testid="error">Error: {error.message}</div>;
        if (data) return <div data-testid="data">{data.message}</div>;

        return <div data-testid="no-data">No data</div>;
      }

      render(
        <Provider value={{ baseUrl: "https://api.example.com" }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId("data")).toHaveTextContent(
          "Data from https://api.example.com"
        );
      });
    });

    it("should handle async errors in store actions", async () => {
      const [Provider, useScope] = createContextScope(
        (context: { shouldFail: boolean }) => {
          const actions = {
            fetchData: () => {
              const { data, error, isLoading } = useAsync(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50));

                if (context.shouldFail) {
                  throw new Error("API request failed");
                }

                return { success: true };
              });

              return { data, error, isLoading };
            },
          };

          return createStore(combine(context, actions));
        }
      );

      function TestComponent() {
        const store = useScope();
        const { data, error, isLoading } = store.fetchData();

        if (isLoading) return <div data-testid="loading">Loading...</div>;
        if (error) return <div data-testid="error">Error: {error.message}</div>;
        if (data) return <div data-testid="success">Success!</div>;

        return <div data-testid="idle">Idle</div>;
      }

      render(
        <Provider value={{ shouldFail: true }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: API request failed"
        );
      });
    });

    it("should support multiple async actions with dependencies", async () => {
      const [Provider, useScope] = createContextScope(
        (context: { userId: string }) => {
          const actions = {
            loadPosts: () => {
              const { data, error, isLoading } = useAsync(async () => {
                await new Promise((resolve) => setTimeout(resolve, 40));
                return [
                  `Post 1 by ${context.userId}`,
                  `Post 2 by ${context.userId}`,
                ];
              }, [context.userId]);

              return {
                posts: data,
                postsError: error,
                postsLoading: isLoading,
              };
            },
            loadProfile: () => {
              const { data, error, isLoading } = useAsync(async () => {
                await new Promise((resolve) => setTimeout(resolve, 30));
                return {
                  email: `user${context.userId}@example.com`,
                  name: `User ${context.userId}`,
                };
              }, [context.userId]);

              return {
                profile: data,
                profileError: error,
                profileLoading: isLoading,
              };
            },
          };

          return createStore(combine(context, actions));
        }
      );

      function TestComponent() {
        const store = useScope();
        const { profile, profileLoading } = store.loadProfile();
        const { posts, postsLoading } = store.loadPosts();

        const profileStatus = profile ? profile.name : "No profile";
        const postsStatus = posts ? `${posts.length} posts` : "No posts";

        return (
          <div>
            <div data-testid="profile-status">
              {profileLoading ? "Loading profile..." : profileStatus}
            </div>

            <div data-testid="posts-status">
              {postsLoading ? "Loading posts..." : postsStatus}
            </div>
          </div>
        );
      }

      render(
        <Provider value={{ userId: "123" }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("profile-status")).toHaveTextContent(
        "Loading profile..."
      );
      expect(screen.getByTestId("posts-status")).toHaveTextContent(
        "Loading posts..."
      );

      await waitFor(() => {
        expect(screen.getByTestId("profile-status")).toHaveTextContent(
          "User 123"
        );
        expect(screen.getByTestId("posts-status")).toHaveTextContent("2 posts");
      });
    });

    it("should re-run async actions when context dependencies change", async () => {
      const [Provider, useScope] = createContextScope(
        (context: { searchTerm: string }) => {
          const actions = {
            search: () => {
              const { data, isLoading } = useAsync(async () => {
                await new Promise((resolve) => setTimeout(resolve, 30));
                return `Results for: ${context.searchTerm}`;
              }, [context.searchTerm]);

              return { results: data, searching: isLoading };
            },
          };

          return createStore(
            combine({ searchTerm: context.searchTerm }, actions)
          );
        }
      );

      function TestComponent() {
        const store = useScope();
        const { results, searching } = store.search();

        return (
          <div>
            <div data-testid="search-term">{store.searchTerm.$get()}</div>
            <div data-testid="status">
              {searching ? "Searching..." : results || "No results"}
            </div>
          </div>
        );
      }

      const { rerender } = render(
        <Provider value={{ searchTerm: "react" }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("search-term")).toHaveTextContent("react");
      expect(screen.getByTestId("status")).toHaveTextContent("Searching...");

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent(
          "Results for: react"
        );
      });

      rerender(
        <Provider value={{ searchTerm: "vue" }}>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByTestId("search-term")).toHaveTextContent("vue");
      expect(screen.getByTestId("status")).toHaveTextContent("Searching...");

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent(
          "Results for: vue"
        );
      });
    });
  });
});
