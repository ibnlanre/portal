import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { usePortal } from "@/component";

describe("usePortal", () => {
  const path = "is-open";
  const initialState = { isOpen: true };

  it("should return the portal state", () => {
    const { result } = renderHook(() =>
      usePortal(path, { state: initialState })
    );
    const [state] = result.current;
    expect(state).toMatchObject(initialState);
  });

  it("should update the portal state", () => {
    const { result } = renderHook(() =>
      usePortal(path, { state: initialState })
    );
    const [, setState] = result.current;

    act(() => {
      setState({ isOpen: false });
    });

    const [{ isOpen }] = result.current;
    expect(isOpen).toBe(false);
  });

  it("should return the correct value for a given path", () => {
    const { result } = renderHook(() =>
      usePortal("count", { store: { count: 0 } })
    );
    const [count, setCount] = result.current;
    expect(count).toBe(0);

    act(() => {
      setCount(1);
    });

    const [newCount] = result.current;
    expect(newCount).toBe(1);
  });

  it("should return the correct value for a nested path", () => {
    const store = { user: { name: "John", age: 30 } };
    const { result } = renderHook(() => usePortal("user.name", { store }));

    const [name, setName] = result.current;
    expect(name).toBe("John");

    act(() => {
      setName("Jane");
    });

    const [newName] = result.current;
    expect(newName).toBe("Jane");
  });
});

describe("usePortal.local", () => {
  afterEach(() => {
    localStorage.clear();
  });

  localStorage.setItem("foo", JSON.stringify("baz"));

  it("should set initial state from local storage", () => {
    const { result } = renderHook(() => usePortal.local("foo"));

    const [state] = result.current;
    expect(state).toEqual("baz");
  });

  it("should set local storage on state change", () => {
    const { result } = renderHook(() => usePortal.local("foo"));
    const [, setState] = result.current;

    act(() => {
      setState("qux");
    });

    const [newState] = result.current;

    expect(newState).toEqual("qux");
    expect(localStorage.getItem("foo")).toBe(JSON.stringify("qux"));
  });
});

describe("usePortal.make", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should make a custom portal with the provided store", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    const userPortal = usePortal.make(userStore);
    expect(userPortal).toBeDefined();
  });

  it("should update the state of the portal using usePortal.local", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    const userPortal = usePortal.make(userStore);
    const { result, unmount } = renderHook(() => userPortal.local("name"));

    const [user, setUser] = result.current;
    expect(user).toBe("John Doe");

    act(() => {
      setUser("Jane Doe");
    });

    const [newUser] = result.current;
    expect(newUser).toBe("Jane Doe");

    unmount()
  });

  it("should update the state of the portal using usePortal.session with custom initial state", () => {
    const userStore = {
      name: "John Doe",
      email: "johndoe@jmail.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    };

    sessionStorage.setItem("oh-my", JSON.stringify("uncle"));

    const userPortal = usePortal.make(userStore);
    const { result, rerender } = renderHook(() => userPortal.session("name"));
    
    const [state, setState] = result.current;
    console.log(sessionStorage.getItem("oh-my"), userStore, state);
    expect(state).toBe("John Doe");

    
    expect(state).toBe("uncle");
    expect(sessionStorage.getItem("oh-my")).toBe(JSON.stringify("uncle"));

    act(() => {
      setState("hello");
    });

    const [newState] = result.current;

    expect(newState).toBe("hello");
    expect(sessionStorage.getItem("oh-my")).toBe(JSON.stringify("hello"));
  });
});
