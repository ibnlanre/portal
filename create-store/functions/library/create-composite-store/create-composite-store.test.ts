import { renderHook } from "@testing-library/react";
import { act, useMemo } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { atom } from "@/create-store/functions/library/atom";

import { createCompositeStore } from "./index";

describe("createCompositeStore", () => {
  it("creates store with initial state", () => {
    const initialState = { key: "value" };
    const store = createCompositeStore(initialState);
    expect(store).toBeDefined();
    expect(store.$get()).toEqual(initialState);
  });

  describe("Basic API", () => {
    const state = {
      count: 0,
      user: {
        name: "John",
        preferences: { notifications: true, theme: "light" },
      },
    };

    const store = createCompositeStore(state);

    describe("$get() method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("gets root state", () => {
        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });
      });

      it("gets nested state", () => {
        expect(store.user.$get()).toEqual({
          name: "John",
          preferences: { notifications: true, theme: "light" },
        });
        expect(store.user.preferences.$get()).toEqual({
          notifications: true,
          theme: "light",
        });
        expect(store.user.preferences.theme.$get()).toBe("light");
      });

      it("gets state with selector function", () => {
        expect(store.count.$get((count) => count + 5)).toBe(5);
        expect(store.user.name.$get((name) => name.toUpperCase())).toBe("JOHN");
      });

      it("gets state via $key path notation", () => {
        expect(store.$key("user.preferences.theme").$get()).toBe("light");
        expect(store.$key("user.preferences").$get()).toEqual({
          notifications: true,
          theme: "light",
        });
      });
    });

    describe("$set() method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("sets root state values", () => {
        store.$set({
          count: 10,
          user: {
            name: "Jane",
            preferences: { notifications: false, theme: "dark" },
          },
        });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.$get()).toEqual({
          count: 10,
          user: {
            name: "Jane",
            preferences: { notifications: false, theme: "dark" },
          },
        });

        store.$set((state) => ({ count: state.count + 10 }));

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.$get()).toEqual({
          count: 20,
          user: {
            name: "Jane",
            preferences: { notifications: false, theme: "dark" },
          },
        });
      });

      it("merges partial root state", () => {
        store.$set({ count: 10 });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.$get()).toEqual({
          count: 10,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });
      });

      it("sets nested state values directly", () => {
        store.user.name.$set("Jane");
        store.user.preferences.theme.$set("dark");

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { notifications: true, theme: "dark" },
          },
        });
      });

      it("sets nested values via $key path notation", () => {
        store
          .$key("user.preferences")
          .$set({ notifications: false, theme: "dark" });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.user.preferences.$get()).toEqual({
          notifications: false,
          theme: "dark",
        });

        store.$key("user.name").$set("Alice");

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        expect(store.user.name.$get()).toBe("Alice");
      });

      it("sets values using update functions", () => {
        store.count.$set((c) => c + 5);

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });
        expect(store.count.$get()).toBe(5);

        store.user.name.$set((name) => name.toUpperCase());
        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });
        expect(store.user.name.$get()).toBe("JOHN");

        store
          .$key("user.preferences.theme")
          .$set((theme) => (theme === "light" ? "dark" : "light"));

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });
        expect(store.user.preferences.$key("theme").$get()).toBe("dark");
        expect(store.user.preferences.theme.$get()).toBe("dark");
      });

      it("preserves other branches when updating nested value with partial input from root", () => {
        store.$set({
          count: 0,
          user: {
            name: "John",
            preferences: { notifications: true, theme: "light" },
          },
        });

        store.$set({ user: { name: "Jane" } });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { notifications: true, theme: "light" },
          },
        });
      });

      it("preserves nested branches when updating from root with partial input", () => {
        store.$set(state);

        store.$set({
          user: {
            name: "Jane",
          },
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { notifications: true, theme: "light" },
          },
        });

        store.$set({
          user: {
            preferences: {
              theme: "dark",
            },
          },
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: {
              notifications: true,
              theme: "dark",
            },
          },
        });
      });

      it("replaces array values completely", () => {
        const store = createCompositeStore({
          todos: [
            { completed: false, id: 1, text: "Learn React" },
            { completed: false, id: 2, text: "Build App" },
          ],
        });

        store.todos.$set((todos) => [
          ...todos,
          { completed: false, id: 3, text: "Deploy" },
        ]);

        expect(store.todos.$get()).toHaveLength(3);
        expect(store.todos.$get()[2].text).toBe("Deploy");
      });
    });

    describe("$key() method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("is defined", () => {
        expect(store.$key("user.preferences.notifications")).toBeDefined();
        expect(store.user.$key("preferences.notifications")).toBeDefined();
        expect(store.user.preferences.$key("notifications")).toBeDefined();
      });

      it("allows chaining $key calls", () => {
        const theme = store.$key("user").$key("preferences").$key("theme");
        expect(theme.$get()).toBe("light");

        theme.$set("dark");
        expect(store.user.preferences.theme.$get()).toBe("dark");
      });

      it("handles non-existent paths gracefully", () => {
        const nonExistentKey: any = "user.nonExistent.property";
        const nonExistent = () => store.$key(nonExistentKey);
        expect(nonExistent).not.toThrow();
        expect(nonExistent().$get()).toBeUndefined();
      });
    });

    describe("$act() method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("calls subscribers with initial state", () => {
        const subscriber = vi.fn();
        store.$act(subscriber);
        expect(subscriber).toHaveBeenCalledWith(store.$get());
      });

      it("notifies subscribers on state changes", () => {
        const rootSubscriber = vi.fn();
        const countSubscriber = vi.fn();
        const userSubscriber = vi.fn();

        store.$act(rootSubscriber);
        store.count.$act(countSubscriber);
        store.user.$act(userSubscriber);

        rootSubscriber.mockClear();
        countSubscriber.mockClear();
        userSubscriber.mockClear();

        store.count.$set(5);

        expect(rootSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({ count: 5 })
        );
        expect(countSubscriber).toHaveBeenCalledWith(5);
        expect(userSubscriber).not.toHaveBeenCalled();

        rootSubscriber.mockClear();
        countSubscriber.mockClear();

        store.user.name.$set("Jane");

        expect(rootSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({ name: "Jane" }),
          })
        );
        expect(countSubscriber).not.toHaveBeenCalled();
        expect(userSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Jane" })
        );
      });

      it("allows unsubscribing from state changes", () => {
        const subscriber = vi.fn();
        const unsubscribe = store.$act(subscriber, false);

        subscriber.mockClear();

        unsubscribe();
        store.$set({ count: 10 });

        expect(subscriber).not.toHaveBeenCalled();
      });
    });
  });

  describe("React Integration", () => {
    describe("$use() method", () => {
      describe("Basic usage", () => {
        const store = createCompositeStore({
          count: 0,
          text: "hello",
        });

        beforeEach(() => {
          store.$set({ count: 0, text: "hello" });
        });

        it("provides state and setter via $use hook", () => {
          const { result } = renderHook(() => store.$use());
          const [state, setState] = result.current;

          expect(state).toEqual({ count: 0, text: "hello" });

          act(() => {
            setState({ count: 5, text: "updated" });
          });

          expect(result.current[0]).toEqual({ count: 5, text: "updated" });
          expect(store.$get()).toEqual({ count: 5, text: "updated" });
        });

        it("allows using nested state in components", () => {
          const { result } = renderHook(() => store.count.$use());
          const [count, setCount] = result.current;

          expect(count).toBe(0);

          act(() => {
            setCount(10);
          });

          expect(result.current[0]).toBe(10);
          expect(store.count.$get()).toBe(10);
        });

        it("supports selectors and dependency arrays", () => {
          const { rerender, result } = renderHook(
            (prefix) =>
              store.text.$use((text) => `${prefix}: ${text}`, [prefix]),
            { initialProps: "prefix" }
          );

          expect(result.current[0]).toBe("prefix: hello");

          act(() => {
            rerender("new prefix");
          });

          expect(result.current[0]).toBe("new prefix: hello");
          expect(store.text.$get()).toBe("hello");
        });

        it("keeps store state in sync across multiple hooks", () => {
          const { result: rootResult } = renderHook(() => store.$use());
          const { result: countResult } = renderHook(() => store.count.$use());
          const { result: textResult } = renderHook(() => store.text.$use());

          act(() => {
            countResult.current[1](50);
          });

          expect(rootResult.current[0]).toEqual({ count: 50, text: "hello" });
          expect(countResult.current[0]).toBe(50);
          expect(textResult.current[0]).toBe("hello");

          act(() => {
            rootResult.current[1]({ count: 100, text: "world" });
          });

          expect(countResult.current[0]).toBe(100);
          expect(textResult.current[0]).toBe("world");
        });

        it("supports deep partial updates with $use hook", () => {
          const complexStore = createCompositeStore({
            settings: {
              autoplay: false,
              volume: 80,
            },
            user: {
              age: 30,
              name: "John",
              preferences: {
                language: "en",
                notifications: true,
                theme: "light",
              },
            },
          });

          const { result: rootResult } = renderHook(() => complexStore.$use());
          const { result: userResult } = renderHook(() =>
            complexStore.user.$use()
          );
          const { result: preferencesResult } = renderHook(() =>
            complexStore.user.preferences.$use()
          );

          act(() => {
            rootResult.current[1]({ user: { name: "Jane" } });
          });

          expect(rootResult.current[0]).toEqual({
            settings: {
              autoplay: false,
              volume: 80,
            },
            user: {
              age: 30,
              name: "Jane",
              preferences: {
                language: "en",
                notifications: true,
                theme: "light",
              },
            },
          });

          act(() => {
            userResult.current[1]({ age: 31, preferences: { theme: "dark" } });
          });

          expect(userResult.current[0]).toEqual({
            age: 31,
            name: "Jane",
            preferences: {
              language: "en",
              notifications: true,
              theme: "dark",
            },
          });

          act(() => {
            preferencesResult.current[1]({ notifications: false });
          });

          expect(preferencesResult.current[0]).toEqual({
            language: "en",
            notifications: false,
            theme: "dark",
          });

          expect(rootResult.current[0].user.preferences.notifications).toBe(
            false
          );
          expect(userResult.current[0].preferences.notifications).toBe(false);
        });
      });

      describe("Advanced usage", () => {
        interface User {
          age: number;
          id: number;
          name: string;
        }

        interface Item {
          id: number;
          ownedBy: number;
          value: string;
        }

        it("demonstrates reactivity issues with useMemo and provides correct solutions", () => {
          const users: User[] = [
            { age: 25, id: 0, name: "Alice" },
            { age: 30, id: 1, name: "Bob" },
          ];

          const items: Item[] = [
            { id: 1, ownedBy: 1, value: "Item 1" },
            { id: 2, ownedBy: 0, value: "Item 2" },
            { id: 3, ownedBy: 1, value: "Item 3" },
          ];

          const commonStore = createCompositeStore({
            getUserItems: (userId: number) => {
              return commonStore.items
                .$get()
                .filter((item) => item.ownedBy === userId);
            },
            items,
            users,
          });

          const userId = 1;

          const { result: problemResult } = renderHook(
            ({ userId }) => {
              const [items] = commonStore.items.$use();

              const userItems = useMemo(() => {
                return commonStore.getUserItems(userId);
              }, [userId]);

              return { items, userItems };
            },
            { initialProps: { userId } }
          );

          expect(problemResult.current.userItems).toHaveLength(2);
          expect(
            problemResult.current.userItems.map((item) => item.id)
          ).toEqual([1, 3]);

          act(() => {
            commonStore.items.$set((prevItems) => [
              ...prevItems,
              { id: 4, ownedBy: userId, value: "Item 4" },
            ]);
          });

          expect(problemResult.current.items).toHaveLength(4);

          expect(problemResult.current.userItems).toHaveLength(2);
          expect(
            problemResult.current.userItems.map((item) => item.id)
          ).toEqual([1, 3]);

          const { result: correctResult } = renderHook(() => {
            const [userItems] = commonStore.items.$use((items) =>
              items.filter((item) => item.ownedBy === userId)
            );
            return { userItems };
          });

          expect(correctResult.current.userItems).toHaveLength(3);
          expect(
            correctResult.current.userItems.map((item) => item.id)
          ).toEqual([1, 3, 4]);

          const { result: correctResult2 } = renderHook(
            ({ userId }) => {
              const [items] = commonStore.items.$use();
              const userItems = useMemo(() => {
                return items.filter((item) => item.ownedBy === userId);
              }, [items, userId]);

              return { userItems };
            },
            { initialProps: { userId } }
          );

          expect(correctResult2.current.userItems).toHaveLength(3);
          expect(
            correctResult2.current.userItems.map((item) => item.id)
          ).toEqual([1, 3, 4]);

          act(() => {
            commonStore.items.$set((prevItems) => [
              ...prevItems,
              { id: 5, ownedBy: userId, value: "Item 5" },
            ]);
          });

          expect(problemResult.current.userItems).toHaveLength(2);

          expect(correctResult.current.userItems).toHaveLength(4);
          expect(
            correctResult.current.userItems.map((item) => item.id)
          ).toEqual([1, 3, 4, 5]);

          expect(correctResult2.current.userItems).toHaveLength(4);
          expect(
            correctResult2.current.userItems.map((item) => item.id)
          ).toEqual([1, 3, 4, 5]);
        });

        it("handles dynamic user selection with derived state", () => {
          const commonStore = createCompositeStore({
            items: [
              { id: 1, ownedBy: 1, value: "Item 1" },
              { id: 2, ownedBy: 0, value: "Item 2" },
              { id: 3, ownedBy: 1, value: "Item 3" },
            ],
            selectedUserId: 1,
            users: [
              { age: 25, id: 0, name: "Alice" },
              { age: 30, id: 1, name: "Bob" },
            ],
          });

          const { result } = renderHook(() => {
            const [selectedUserId] = commonStore.selectedUserId.$use();

            const [userItems] = commonStore.$use((state) =>
              state.items.filter(
                (item) => item.ownedBy === state.selectedUserId
              )
            );
            const [selectedUser] = commonStore.$use((state) =>
              state.users.find((user) => user.id === state.selectedUserId)
            );

            return { selectedUser, selectedUserId, userItems };
          });

          expect(result.current.selectedUserId).toBe(1);
          expect(result.current.selectedUser?.name).toBe("Bob");
          expect(result.current.userItems).toHaveLength(2);
          expect(result.current.userItems.map((item) => item.id)).toEqual([
            1, 3,
          ]);

          act(() => {
            commonStore.selectedUserId.$set(0);
          });

          expect(result.current.selectedUserId).toBe(0);
          expect(result.current.selectedUser?.name).toBe("Alice");
          expect(result.current.userItems).toHaveLength(1);
          expect(result.current.userItems.map((item) => item.id)).toEqual([2]);

          act(() => {
            commonStore.items.$set((prevItems) => [
              ...prevItems,
              { id: 4, ownedBy: 0, value: "Item 4" },
            ]);
          });

          expect(result.current.userItems).toHaveLength(2);
          expect(result.current.userItems.map((item) => item.id)).toEqual([
            2, 4,
          ]);
        });
      });
    });
  });

  describe("Advanced Store Patterns", () => {
    describe("Atomic object values", () => {
      it("marks an object as a value object", () => {
        const obj = { language: "en", theme: "dark" };
        const marked = atom(obj);

        expect(marked).toBe(obj);
      });

      it("is idempotent - calling atomic multiple times is safe", () => {
        const obj = { theme: "dark" };
        const marked1 = atom(obj);
        const marked2 = atom(marked1);

        expect(marked1).toBe(marked2);
      });

      it("does not affect object enumeration", () => {
        const obj = { language: "en", theme: "dark" };
        const marked = atom(obj);

        expect(Object.keys(marked)).toEqual(
          expect.arrayContaining(["language", "theme"])
        );
        expect(Object.values(marked)).toEqual(
          expect.arrayContaining(["en", "dark"])
        );
      });

      it("does partial updates for regular objects", () => {
        const store = createCompositeStore({
          settings: {
            brightness: 80,
            volume: 50,
          },
        });

        store.settings.$set({ volume: 75 });

        expect(store.settings.$get()).toEqual({
          brightness: 80,
          volume: 75,
        });
      });

      it("does complete replacement for value objects", () => {
        const store = createCompositeStore({
          preferences: atom({
            language: "en",
            notifications: true,
            theme: "dark",
          }),
        });

        store.preferences.$set({ theme: "light" });

        expect(store.preferences.$get()).toEqual({
          theme: "light",
        });
      });

      it("handles mixed scenarios - regular and value objects together", () => {
        const store = createCompositeStore({
          user: {
            name: "John",
            preferences: atom({
              language: "en",
              notifications: true,
              theme: "dark",
            }),
            settings: {
              brightness: 80,
              volume: 50,
            },
          },
        });

        store.user.settings.$set({ volume: 75 });
        expect(store.user.settings.$get()).toEqual({
          brightness: 80,
          volume: 75,
        });

        store.user.preferences.$set({ language: "fr", theme: "light" });
        expect(store.user.preferences.$get()).toEqual({
          language: "fr",
          theme: "light",
        });

        expect(store.user.name.$get()).toBe("John");
      });

      it("returns value objects directly, not as store proxies", () => {
        const store = createCompositeStore({
          preferences: atom({
            language: "en",
            theme: "dark",
          }),
          settings: {
            volume: 50,
          },
        });

        const preferences = store.preferences;
        const settings = store.settings;

        // Atomic objects should still have proxy methods like primitives
        expect(preferences.$get()).toEqual({ language: "en", theme: "dark" });
        expect(settings.$get()).toEqual({ volume: 50 });

        expect(typeof preferences).toBe("object");
        expect("$get" in preferences).toBe(true); // Atomic objects should have $get
        expect("$set" in preferences).toBe(true); // Atomic objects should have $set

        expect("$get" in settings).toBe(true);
        expect("$set" in settings).toBe(true);
      });

      it("should allow direct property access on value objects", () => {
        const store = createCompositeStore({
          preferences: atom({
            language: "en",
            theme: "dark",
          }),
        });

        const preferences = store.preferences.$get();

        expect(preferences.theme).toBe("dark");
        expect(preferences.language).toBe("en");
      });

      it("should handle value objects nested within regular objects", () => {
        const store = createCompositeStore({
          user: {
            profile: {
              name: "John",
              preferences: atom({
                language: "en",
                theme: "dark",
              }),
            },
          },
        });

        store.user.profile.name.$get();
        store.user.profile.preferences.$get().theme;

        store.user.profile.preferences.$set(atom({ theme: "light" }));

        expect(store.user.profile.preferences.$get()).toEqual({
          theme: "light",
        });

        expect(store.user.profile.name.$get()).toBe("John");
      });

      it("should handle value objects containing regular objects", () => {
        const store = createCompositeStore({
          config: atom({
            api: {
              timeout: 5000,
            },
            ui: {
              sidebar: "collapsed",
              theme: "dark",
            },
          }),
        });

        store.config.$set({
          ui: {
            theme: "light",
          },
        });

        expect(store.config.$get()).toEqual({
          ui: {
            theme: "light",
          },
        });
      });

      it("should work with function-based updates for value objects", () => {
        const store = createCompositeStore({
          preferences: atom({
            language: "en",
            theme: "dark",
          }),
        });

        store.preferences.$set((current) => {
          expect(current).toEqual({ language: "en", theme: "dark" });
          return { fontSize: 14, theme: "light" };
        });

        expect(store.preferences.$get()).toEqual({
          fontSize: 14,
          theme: "light",
        });
      });

      it("should work with function-based updates for regular objects", () => {
        const store = createCompositeStore({
          settings: {
            brightness: 80,
            volume: 50,
          },
        });

        store.settings.$set((current) => {
          expect(current).toEqual({ brightness: 80, volume: 50 });
          return { volume: 75 };
        });

        expect(store.settings.$get()).toEqual({
          brightness: 80,
          volume: 75,
        });
      });

      it("should handle empty value objects", () => {
        const store = createCompositeStore({
          empty: atom({}),
        });

        expect(store.empty.$get()).toEqual({});

        store.empty.$set(atom({ newProp: "value" }));
        expect(store.empty.$get()).toEqual({ newProp: "value" });
      });

      it("should handle setting non-value object to value object path", () => {
        const store = createCompositeStore({
          preferences: atom<{
            language: string;
            theme: string;
          }>({}),
        });

        store.preferences.$set({ language: "en", theme: "light" });

        store.preferences.$get().language;

        expect(store.preferences.$get()).toMatchObject({
          theme: "light",
        });
      });
    });
    describe("Selector Functions", () => {
      const store = createCompositeStore({
        filters: { showActive: true },
        users: [
          { active: true, id: 1, name: "John" },
          { active: false, id: 2, name: "Jane" },
          { active: true, id: 3, name: "Bob" },
        ],
      });

      beforeEach(() => {
        store.$set({
          filters: { showActive: true },
          users: [
            { active: true, id: 1, name: "John" },
            { active: false, id: 2, name: "Jane" },
            { active: true, id: 3, name: "Bob" },
          ],
        });
      });

      it("should handle complex selector transformations", () => {
        const activeUsers = store.users.$get((users) =>
          users.filter((user) => user.active)
        );

        expect(activeUsers).toHaveLength(2);
        expect(activeUsers.map((user) => user.name)).toEqual(["John", "Bob"]);
      });

      it("should handle selectors with multiple dependencies", () => {
        const filteredUsers = store.$get((state) => {
          const { filters, users } = state;
          return filters.showActive
            ? users.filter((user) => user.active)
            : users;
        });

        expect(filteredUsers).toHaveLength(2);

        store.filters.showActive.$set(false);
        const allUsers = store.$get((state) => {
          const { filters, users } = state;
          return filters.showActive
            ? users.filter((user) => user.active)
            : users;
        });

        expect(allUsers).toHaveLength(3);
      });

      it("should handle async selector scenarios", async () => {
        const asyncSelector = async (
          users: {
            active: boolean;
            id: number;
            name: string;
          }[]
        ) => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return users.filter((user) => user.active).length;
        };

        const activeCount = await asyncSelector(store.users.$get());
        expect(activeCount).toBe(2);
      });
    });

    describe("Method-based patterns", () => {
      describe("Reducer Pattern", () => {
        const count = createCompositeStore({
          decrease(value: number = 1) {
            count.value.$set((state) => state - value);
          },
          increase(value: number = 1) {
            count.value.$set((state) => state + value);
          },
          reset() {
            count.value.$set(0);
          },
          set(value: number) {
            count.value.$set(value);
          },
          value: 0,
        });

        beforeEach(() => {
          count.reset();
        });

        it("should execute store methods correctly", () => {
          expect(count.value.$get()).toBe(0);

          count.increase();
          expect(count.value.$get()).toBe(1);

          count.increase(5);
          expect(count.value.$get()).toBe(6);

          count.decrease(2);
          expect(count.value.$get()).toBe(4);

          count.set(10);
          expect(count.value.$get()).toBe(10);

          count.reset();
          expect(count.value.$get()).toBe(0);
        });

        it("should access methods via $key", () => {
          count.$key("increase")(3);
          expect(count.value.$get()).toBe(3);

          count.$key("decrease")(1);
          expect(count.value.$get()).toBe(2);

          count.$key("set")(5);
          expect(count.value.$get()).toBe(5);

          count.$key("reset")();
          expect(count.value.$get()).toBe(0);
        });

        it("should handle method calls in React components", () => {
          const { result } = renderHook(() => count.$use());
          const [state] = result.current;

          act(() => {
            count.increase(3);
          });

          expect(count.value.$get()).toBe(3);

          const [updatedState] = result.current;
          expect(updatedState.value).toBe(3);

          const { result: valueResult } = renderHook(() => count.value.$use());
          expect(valueResult.current[0]).toBe(3);
        });
      });

      describe("Complex Business Logic", () => {
        const store = createCompositeStore({
          bears: 0,
          eatFish: () => {
            store.fish.$set((state) => Math.max(0, state - 1));
            if (store.fish.$get() === 0) {
              store.bears.$set((state) => Math.max(0, state - 1));
            }
          },
          fish: 10,
          increasePopulation: (by: number = 1) => {
            store.bears.$set((state) => state + by);
          },
          removeAllBears: () => {
            store.bears.$set(0);
          },
          reset: () => {
            store.bears.$set(0);
            store.fish.$set(10);
          },
        });

        beforeEach(() => {
          store.$set({ bears: 0, fish: 10 });
        });

        it("should correctly implement business logic through methods", () => {
          store.increasePopulation(5);
          expect(store.bears.$get()).toBe(5);
          expect(store.fish.$get()).toBe(10);

          store.eatFish();
          store.eatFish();
          expect(store.fish.$get()).toBe(8);

          store.removeAllBears();
          expect(store.bears.$get()).toBe(0);

          store.bears.$set(3);
          store.fish.$set(2);
          store.reset();

          expect(store.bears.$get()).toBe(0);
          expect(store.fish.$get()).toBe(10);
        });

        it("should handle complex scenarios with interactions", () => {
          store.increasePopulation(5);

          for (let i = 0; i < 10; i++) {
            store.eatFish();
          }

          expect(store.fish.$get()).toBe(0);
          expect(store.bears.$get()).toBe(4);

          store.eatFish();
          expect(store.bears.$get()).toBe(3);

          store.$set({ fish: 5 });
          expect(store.$get()).toEqual(
            expect.objectContaining({ bears: 3, fish: 5 })
          );

          store.increasePopulation(2);
          expect(store.bears.$get()).toBe(5);
        });

        it("should integrate with React components", () => {
          const { result } = renderHook(() => {
            const [state] = store.$use();
            const [bearCount] = store.bears.$use();

            return { bearCount, state };
          });

          expect(result.current.state).toEqual(
            expect.objectContaining({ bears: 0, fish: 10 })
          );
          expect(result.current.bearCount).toBe(0);

          act(() => {
            store.increasePopulation(3);
          });

          const { result: updatedResult } = renderHook(() => {
            const [state] = store.$use();
            const [bearCount] = store.bears.$use();
            return { bearCount, state };
          });

          expect(updatedResult.current.state.bears).toBe(3);
          expect(updatedResult.current.bearCount).toBe(3);
        });
      });
    });

    describe("Circular References", () => {
      it("should handle circular references in selectors", () => {
        const circularObj: { ref: null | typeof circularObj } = { ref: null };
        circularObj.ref = circularObj;

        const store = createCompositeStore({
          data: { value: circularObj },
        });

        expect(() => store.data.value.$get()).not.toThrow();

        const value = store.data.value.ref.$get();
        expect(value?.ref?.ref?.ref?.ref?.ref?.ref).toStrictEqual(circularObj);
        expect(value?.ref?.ref).toBe(value);
      });

      it("should handle creating store with circular reference", () => {
        const circularObj: { ref: null | typeof circularObj } = { ref: null };
        circularObj.ref = circularObj;

        expect(() => {
          const store = createCompositeStore({
            data: { value: circularObj },
          });
        }).not.toThrow();
      });

      it("should handle accessing value with circular reference", () => {
        const circularObj: { ref: null | typeof circularObj } = { ref: null };
        circularObj.ref = circularObj;

        const store = createCompositeStore({
          data: { value: circularObj },
        });

        expect(() => store.data.value.$get()).not.toThrow();
      });

      it("should reuse augmented objects for circular references", () => {
        const circularObj: { ref?: typeof circularObj; value: number } = {
          value: 42,
        };
        circularObj.ref = circularObj;

        const store = createCompositeStore({
          data: circularObj,
          other: circularObj,
        });

        expect(store.data).toBe(store.other);

        expect(store.data.$get).toBeDefined();
        expect(store.data.value.$get).toBeDefined();
        expect(store.data.value.$get()).toBe(42);

        expect(() => store.data.ref?.$get()).not.toThrow();
        expect(store.data.ref?.$get()).toEqual(circularObj);
        expect(store.data.ref).toEqual(store.data);
        expect(store.other.ref?.ref).toEqual(store.other);
      });

      it("should handle deeply nested circular references", () => {
        const objA: { name: string; ref?: typeof objB } = { name: "A" };
        const objB: { name: string; ref: typeof objA } = {
          name: "B",
          ref: objA,
        };
        objA.ref = objB;

        const store = createCompositeStore({
          container: {
            a: objA,
            b: objB,
          },
        });

        expect(() => store.container.a.$get()).not.toThrow();
        expect(() => store.container.b.$get()).not.toThrow();

        expect(store.container.a.ref).toEqual(store.container.b);
        expect(store.container.b.ref).toEqual(store.container.a);

        expect(store.container.a.name.$get()).toBe("A");
        expect(store.container.b.name.$get()).toBe("B");
      });
    });
  });

  describe("Memory Management and Performance", () => {
    describe("Memory efficiency", () => {
      it("should handle large objects efficiently", () => {
        const data = Array.from({ length: 100 }, (_, i) => ({
          id: i,
          value: `item-${i}`,
        }));
        const store = createCompositeStore({ data });

        let lastResult: typeof data | undefined;
        for (let i = 0; i < 10; i++) {
          const result = store.data.$get();

          expect(result).toHaveLength(100);
          expect(result[0]).toEqual({ id: 0, value: "item-0" });

          lastResult = result;
        }

        expect(lastResult).toHaveLength(100);
        expect(lastResult?.[99]).toEqual({ id: 99, value: "item-99" });
      });

      it("should allow garbage collection of returned states", () => {
        const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
        const store = createCompositeStore({ data: { items } });

        const results: Array<{ items: string[] }> = [];
        for (let i = 0; i < 5; i++) {
          const state = store.data.$get();
          results.push(state);

          expect(state.items).toHaveLength(100);
          expect(state.items[0]).toBe("item-0");
        }

        expect(results).toHaveLength(5);

        expect(results[0]).not.toBe(results[1]);
        expect(results[0].items).not.toBe(results[1].items);
        expect(results[0].items).toBeInstanceOf(Array);

        results[0].items[0] = "modified";
        expect(results[1].items[0]).toBe("item-0");
      });

      it("should handle large state objects efficiently", () => {
        const largeState: Record<
          string,
          { nested: { data: number }; value: number }
        > = {};

        for (let i = 0; i < 1000; i++) {
          largeState[`key${i}`] = { nested: { data: i * 2 }, value: i };
        }

        const store = createCompositeStore(largeState);
        expect(store.key99?.value?.$get()).toBe(99);
      });

      it("should properly clean up subscribers on unsubscribe", () => {
        const store = createCompositeStore({ count: 0 });
        const subscribers = [];

        for (let i = 0; i < 10; i++) {
          const unsubscribe = store.count.$act(() => {});
          subscribers.push(unsubscribe);
        }

        subscribers.forEach((unsub) => unsub());

        store.count.$set(42);
        expect(store.count.$get()).toBe(42);
      });

      it("should benchmark clone vs no-clone performance", () => {
        const largeState = {
          settings: { language: "en", theme: "dark" },
          users: Array.from({ length: 50 }, (_, i) => ({
            id: i,
            name: `User ${i}`,
            profile: { active: i % 2 === 0, age: 20 + (i % 50) },
          })),
        };

        const store = createCompositeStore(largeState);

        const results: unknown[] = [];
        for (let i = 0; i < 10; i++) {
          const state = store.$get();
          results.push(state);

          expect((state as any).settings.language).toBe("en");
          expect((state as any).users).toHaveLength(50);
          expect((state as any).users[0].name).toBe("User 0");
        }

        expect(results).toHaveLength(10);

        (results[0] as any).settings.language = "fr";
        expect((results[1] as any).settings.language).toBe("en");

        expect(store.settings.language.$get()).toBe("en");
      });
    });

    describe("State isolation and immutability", () => {
      it("should isolate state returned by $get from store mutations", () => {
        const store = createCompositeStore({
          settings: { theme: "dark" },
          user: { age: 30, name: "John" },
        });

        const state1 = store.$get();
        const state2 = store.$get();

        expect(state1).toEqual(state2);
        expect(state1).not.toBe(state2);
        expect(state1.user).not.toBe(state2.user);

        state1.user.name = "Jane";
        state1.settings.theme = "light";

        expect(store.user.name.$get()).toBe("John");
        expect(store.settings.theme.$get()).toBe("dark");

        expect(state2.user.name).toBe("John");
        expect(state2.settings.theme).toBe("dark");
      });

      it("should isolate nested state returned by $get", () => {
        const store = createCompositeStore({
          data: {
            items: [1, 2, 3],
            metadata: { count: 3, type: "array" },
          },
        });

        const items1 = store.data.items.$get();
        const items2 = store.data.items.$get();

        expect(items1).toEqual(items2);
        expect(items1).not.toBe(items2);

        items1.push(4);
        expect(store.data.items.$get()).toEqual([1, 2, 3]);
        expect(items2).toEqual([1, 2, 3]);
      });

      it("should isolate state with selectors", () => {
        const store = createCompositeStore({
          users: [
            { active: true, id: 1, name: "Alice" },
            { active: false, id: 2, name: "Bob" },
          ],
        });

        const activeUsers1 = store.users.$get((users) =>
          users.filter((u) => u.active)
        );
        const activeUsers2 = store.users.$get((users) =>
          users.filter((u) => u.active)
        );

        expect(activeUsers1).toEqual(activeUsers2);
        expect(activeUsers1).not.toBe(activeUsers2);

        activeUsers1[0].name = "Modified";
        expect(store.users.$get()[0].name).toBe("Alice");
      });
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety with nested objects", () => {
      const userState = {
        profile: {
          age: 30,
          name: "John",
          settings: {
            notifications: true,
            theme: "light" as "dark" | "light",
          },
        },
      };

      const store = createCompositeStore(userState);

      expect(store.profile.name.$get()).toBe("John");
      expect(store.profile.age.$get()).toBe(30);
      expect(store.profile.settings.theme.$get()).toBe("light");

      store.profile.settings.theme.$set("dark");
      expect(store.profile.settings.theme.$get()).toBe("dark");
    });

    it("should handle optional properties correctly", () => {
      const store = createCompositeStore({
        user: {
          email: undefined as string | undefined,
          name: "John",
        },
      });

      expect(store.user.name.$get()).toBe("John");
      expect(store.user.email.$get()).toBeUndefined();

      store.user.email.$set("john@example.com");
      expect(store.user.email.$get()).toBe("john@example.com");
    });
  });

  describe("State Mutation Protection", () => {
    describe("Root state setter protection", () => {
      it("should prevent mutations to original state when using function setter on objects", () => {
        const originalState = {
          settings: { notifications: true, theme: "light" },
          user: { age: 30, name: "John" },
        };

        const store = createCompositeStore(originalState);
        const stateBefore = store.$get();

        store.$set((state) => {
          state.user.name = "Mutated";
          state.settings.theme = "dark";
          return { user: { age: 25, name: "Jane" } };
        });

        expect(stateBefore.user.name).toBe("John");
        expect(stateBefore.settings.theme).toBe("light");

        expect(store.$get().user.name).toBe("Jane");
        expect(store.$get().user.age).toBe(25);
        expect(store.$get().settings.theme).toBe("light");
      });

      it("should prevent mutations to original state when using function setter on arrays", () => {
        const originalState = {
          items: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
          ],
          metadata: { count: 2 },
        };

        const store = createCompositeStore(originalState);
        const stateBefore = store.$get();

        store.$set((state) => {
          state.items.push({ id: 3, name: "Mutated Item" });
          state.items[0]!.name = "Mutated";

          return { items: [{ id: 1, name: "Updated Item" }] };
        });

        expect(stateBefore.items).toHaveLength(2);
        expect(stateBefore.items.at(0)?.name).toBe("Item 1");

        expect(store.$get().items).toHaveLength(1);
        expect(store.$get().items.at(0)?.name).toBe("Updated Item");
      });
    });

    describe("Nested state setter protection", () => {
      it("should prevent mutations to original nested objects", () => {
        const store = createCompositeStore({
          settings: { language: "en" },
          user: {
            preferences: { notifications: true, theme: "light" },
            profile: { age: 30, name: "John" },
          },
        });

        const userBefore = store.user.$get();

        store.user.$set((user) => {
          user.profile.name = "Mutated";
          user.preferences.theme = "dark";

          return { profile: { age: 25, name: "Jane" } };
        });

        expect(userBefore.profile.name).toBe("John");
        expect(userBefore.preferences.theme).toBe("light");

        expect(store.user.$get().profile.name).toBe("Jane");
        expect(store.user.$get().profile.age).toBe(25);
        expect(store.user.$get().preferences.theme).toBe("light");
      });

      it("should prevent mutations to original nested arrays", () => {
        const store = createCompositeStore({
          data: {
            items: [
              { id: 1, name: "Item 1" },
              { id: 2, name: "Item 2" },
            ],
            tags: ["tag1", "tag2"],
          },
          metadata: { version: 1 },
        });

        const dataBefore = store.data.$get();

        store.data.$set((data) => {
          data.items.push({ id: 3, name: "Mutated" });
          data.tags[0] = "mutated";
          return { items: [{ id: 1, name: "Updated" }] };
        });

        expect(dataBefore.items).toHaveLength(2);
        expect(dataBefore.items.at(0)?.name).toBe("Item 1");
        expect(dataBefore.tags.at(0)).toBe("tag1");

        expect(store.data.$get().items).toHaveLength(1);
        expect(store.data.$get().items.at(0)?.name).toBe("Updated");
      });
    });

    describe("Deep path setter protection", () => {
      it("should prevent mutations when using $key path notation", () => {
        const store = createCompositeStore({
          app: {
            user: {
              permissions: ["read", "write"],
              profile: { name: "John", settings: { theme: "light" } },
            },
          },
        });

        const profileBefore = store.$key("app.user.profile").$get();

        store.$key("app.user.profile").$set((profile) => {
          profile.name = "Mutated";
          profile.settings.theme = "dark";

          return { name: "Jane" };
        });

        expect(profileBefore.name).toBe("John");
        expect(profileBefore.settings.theme).toBe("light");

        expect(store.$key("app.user.profile").$get().name).toBe("Jane");
        expect(store.$key("app.user.profile").$get().settings.theme).toBe(
          "light"
        );
      });
    });

    describe("Complex nested structure protection", () => {
      it("should handle deeply nested objects with arrays and mixed types", () => {
        const complexState = {
          app: {
            global: { features: { beta: true }, version: "1.0" },
            modules: [
              {
                config: { enabled: true, settings: { debug: false } },
                dependencies: ["dep1", "dep2"],
                id: 1,
              },
              {
                config: { enabled: false, settings: { debug: true } },
                dependencies: ["dep3"],
                id: 2,
              },
            ],
          },
        };

        const store = createCompositeStore(complexState);
        const modulesBefore = store.app.modules.$get();

        store.app.modules.$set((modules) => {
          modules.at(0)!.config.enabled = false;
          modules.at(0)?.dependencies.push("mutated");
          modules.at(1)!.config.settings.debug = false;
          modules.push({
            config: { enabled: true, settings: { debug: true } },
            dependencies: [],
            id: 3,
          });

          return [
            {
              config: { enabled: true, settings: { debug: true } },
              dependencies: ["updated"],
              id: 1,
            },
          ];
        });

        expect(modulesBefore).toHaveLength(2);
        expect(modulesBefore.at(0)?.config.enabled).toBe(true);
        expect(modulesBefore.at(0)?.config.settings.debug).toBe(false);
        expect(modulesBefore.at(0)?.dependencies).toEqual(["dep1", "dep2"]);
        expect(modulesBefore.at(1)?.config.enabled).toBe(false);
        expect(modulesBefore.at(1)?.config.settings.debug).toBe(true);

        const newModules = store.app.modules.$get();
        expect(newModules).toHaveLength(1);
        expect(newModules.at(0)?.id).toBe(1);
        expect(newModules.at(0)?.config.enabled).toBe(true);
        expect(newModules.at(0)?.config.settings.debug).toBe(true);
        expect(newModules.at(0)?.dependencies).toEqual(["updated"]);
      });
    });

    describe("Reference equality checks", () => {
      it("should ensure original state references are not shared with snapshots", () => {
        const originalObject = { shared: { value: "original" } };
        const store = createCompositeStore({
          data: originalObject,
          other: { value: "test" },
        });

        let capturedState: any;

        store.data.$set((data) => {
          capturedState = data;
          return { shared: { value: "updated" } };
        });

        expect(capturedState).not.toBe(originalObject);
        expect(capturedState.shared).not.toBe(originalObject.shared);

        expect(capturedState.shared.value).toBe("original");

        capturedState.shared.value = "should not affect anything";
        expect(store.data.$get().shared.value).toBe("updated");
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle undefined and null values", () => {
      const store = createCompositeStore({
        data: { value: 42 as null | number | undefined },
      });

      store.data.$set({ value: undefined });
      expect(store.data.value.$get()).toBeUndefined();

      store.data.$set({ value: null });
      expect(store.data.value.$get()).toBeNull();
    });

    it("should handle deep path navigation", () => {
      const store = createCompositeStore({
        nested: { deep: { value: "test" } },
      });

      const deepPath = store.$key("nested.deep.value");
      expect(deepPath.$get()).toBe("test");

      deepPath.$set("updated");
      expect(store.nested.deep.value.$get()).toBe("updated");
    });

    it("should handle array-like objects", () => {
      const store = createCompositeStore({
        data: { items: [1, 2, 3] },
      });

      expect(store.data.items.$get()).toEqual([1, 2, 3]);

      store.data.items.$set([4, 5, 6]);
      expect(store.data.items.$get()).toEqual([4, 5, 6]);
    });

    it("should handle numeric keys", () => {
      const store = createCompositeStore({
        data: { "0": "first", "1": "second" },
      });

      expect(store.data["0"].$get()).toBe("first");
      expect(store.data["1"].$get()).toBe("second");
    });

    it("should handle symbol keys", () => {
      const sym = Symbol("test");
      const objWithSymbol = { regular: "regular", [sym]: "symbol value" };

      const store = createCompositeStore({
        data: objWithSymbol,
      });

      expect(store.data.regular.$get()).toBe("regular");

      expect(store.data.$get()[sym]).toBe("symbol value");
    });

    it("should handle state serialization and deserialization", () => {
      const initialState = {
        settings: { theme: "dark" },
        user: { age: 30, name: "John" },
      };

      const store = createCompositeStore(initialState);

      const serialized = JSON.stringify(store.$get());
      const deserialized = JSON.parse(serialized);

      const newStore = createCompositeStore(deserialized);
      expect(newStore.$get()).toEqual(initialState);
    });
  });
});
