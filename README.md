# @ibnlanre/portal

[![npm version](https://badge.fury.io/js/%40ibnlanre%2Fportal.svg)](https://badge.fury.io/js/%40ibnlanre%2Fportal)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ibnlanre/portal/pages/pages-build-deployment?branch=master)](https://github.com/ibnlanre/portal/actions)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

`@ibnlanre/portal` is a TypeScript state management library designed to help you manage complex application state with an intuitive API. It focuses on developer experience, robust type safety, and comprehensive features. This document is your complete guide to understanding, installing, and effectively using the library.

## Table of contents

- [Features](#features)
- [Get started](#get-started)
  - [Prerequisites](#prerequisites)
  - [Install the library](#install-the-library)
- [Understand core concepts](#understand-core-concepts)
  - [What is a store?](#what-is-a-store)
  - [Store types: Primitive and Composite](#store-types-primitive-and-composite)
  - [Immutability and reactivity](#immutability-and-reactivity)
- [Configure your stores](#configure-your-stores)
- [Use the API: Reference and examples](#use-the-api-reference-and-examples)
  - [Create stores: `createStore()`](#create-stores-createstore)
  - [Use store instance methods](#use-store-instance-methods)
    - [`$get()`](#get)
    - [`$set()`](#set)
    - [`$act()`](#act)
    - [`$key()`](#key)
    - [`$use()` (React Hook)](#use-react-hook)
  - [Define actions: Functions in stores](#define-actions-functions-in-stores)
  - [Actions as hooks](#actions-as-hooks)
  - [Combine stores and actions: `combine()`](#combine-stores-and-actions-combine)
  - [Initialize state asynchronously](#initialize-state-asynchronously)
  - [Handle circular references](#handle-circular-references)
  - [Handle arrays in stores](#handle-arrays-in-stores)
  - [Normalize objects: `normalizeObject()`](#normalize-objects-normalizeobject)
  - [Infer state types: `InferType`](#infer-state-types-infertype)
  - [Persist state](#persist-state)
    - [Web Storage adapters](#web-storage-adapters)
    - [Cookie Storage adapter](#cookie-storage-adapter)
    - [Browser Storage adapter](#browser-storage-adapter)
    - [Async Browser Storage adapter](#async-browser-storage-adapter)
  - [Cookie Storage](#cookie-storage)
    - [`sign()`](#sign)
    - [`unsign()`](#unsign)
    - [`getItem()`](#getitem)
    - [`setItem()`](#setitem)
    - [`removeItem()`](#removeitem)
    - [`clear()`](#clear)
    - [`createKey()`](#createkey)
    - [`key()`](#key)
    - [`length`](#length)
- [Explore advanced usage](#explore-advanced-usage)
  - [Use direct store creation functions](#use-direct-store-creation-functions)
    - [`createPrimitiveStore()`](#createprimitivestore)
    - [`createCompositeStore()`](#createcompositestore)
- [Optimize performance](#optimize-performance)
- [Understand limitations](#understand-limitations)
- [Follow best practices](#follow-best-practices)
- [Troubleshoot common issues](#troubleshoot-common-issues)
- [Contribute to the project](#contribute-to-the-project)
- [Get help and support](#get-help-and-support)
- [License](#license)

## Features

`@ibnlanre/portal` offers a robust set of features to streamline state management:

- **Intuitive API**: Interact with state using simple and consistent methods: `$get`, `$set`, and `$act`.
- **Deep partial updates**: Intelligently merge updates into nested state structures without boilerplate.
- **Circular reference support**: Safely manage complex objects, including browser objects after normalization.
- **Object normalization**: Convert interface-typed objects (e.g., `window`, API responses) for store compatibility using `normalizeObject`.
- **Comprehensive type safety**: Leverage full TypeScript support with robust type inference for a reliable development experience.
- **Seamless React integration**: Connect stores to React components effortlessly using the `$use` hook, with automatic subscription management.
- **Actions as hooks**: Create actions that can behave like React hooks, allowing you to use hooks like `useState` and `useEffect` inside your store's actions.
- **Flexible store types**: Manage both primitive values (strings, numbers, booleans) and complex, nested objects within a unified system.
- **State persistence**: Persist state across sessions with built-in adapters for Local Storage, Session Storage, and Cookie Storage.
- **Flexible persistence**: Use the `createAsyncBrowserStorageAdapter` for more control over how state is transformed before being stored or used.
- **Action management**: Define and use actions (functions) directly within your stores to co-locate state logic.
- **Utility functions**: Use helpers like `combine` to simplify merging state and actions.
- **Asynchronous initialization**: Initialize stores with data fetched from APIs or other asynchronous sources.

## Get started

This section guides you through setting up `@ibnlanre/portal` in your project.

### Prerequisites

Before you begin, ensure your development environment includes:

- Node.js (version 16.x or later recommended)
- A package manager: npm, pnpm, or yarn
- TypeScript (version 4.5 or later, if you are using TypeScript in your project)

### Install the library

You can add `@ibnlanre/portal` to your project using a package manager or by including it from a CDN.

#### Using a package manager

1.  Navigate to your project directory in the terminal.
2.  Run one of the following commands, depending on your package manager:

    **npm**

    ```bash
    npm install @ibnlanre/portal
    ```

    **pnpm**

    ```bash
    pnpm add @ibnlanre/portal
    ```

    **yarn**

    ```bash
    yarn add @ibnlanre/portal
    ```

    The library includes TypeScript definitions, so no separate `@types` package is needed.

#### Using a CDN

For projects that don't use a package manager (e.g., simple HTML pages or online playgrounds), you can include `@ibnlanre/portal` from a CDN:

**Skypack**

```html
<script type="module">
  import { createStore } from "https://cdn.skypack.dev/@ibnlanre/portal";
  // Use createStore and other exports here
</script>
```

**unpkg**

```html
<script src="https://unpkg.com/@ibnlanre/portal"></script>
<!-- The library will be available globally, e.g., window.Portal.createStore -->
```

**jsDelivr**

```html
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
<!-- The library will be available globally, e.g., window.Portal.createStore -->
```

## Understand core concepts

Understanding these core concepts will help you use `@ibnlanre/portal` effectively.

### What is a store?

A store is an object that holds your application's state. It allows you to read the state, update it, and subscribe to changes. `@ibnlanre/portal` stores can hold any kind of data, from simple primitive values to complex, nested objects.

### Store types: Primitive and Composite

`@ibnlanre/portal` distinguishes between two main types of stores, created automatically based on the initial state you provide:

1.  **Primitive Store**: Manages a single, primitive value (e.g., a string, number, boolean, null, or undefined).

2.  **Composite Store**: Manages an object, enabling nested state structures. Each property in a composite store's initial object can itself become a store instance (either primitive or composite), allowing for granular state management and access.

Both store types share a consistent API for getting, setting, and subscribing to state.

### Immutability and reactivity

`@ibnlanre/portal` embraces immutability. When you update the state, the library creates a new state object instead of modifying the existing one. This helps prevent bugs and makes state changes predictable.

Stores are reactive. When a store's state changes, any components or subscribers listening to that store (or its parts) are notified, allowing your UI to update automatically.

## Configure your stores

`@ibnlanre/portal` is designed to work with minimal configuration. The primary configuration points are:

1.  **Store Initialization**: When you call `createStore()`, you provide the initial state. This is the main configuration for a store's structure and default values.
2.  **Persistence Adapters**: If you use state persistence, you configure adapters with options like storage keys and serialization functions.

For example, to configure a Local Storage adapter:

```typescript
import { createLocalStorageAdapter } from "@ibnlanre/portal";

const [getPersistentState, setPersistentState] = createLocalStorageAdapter(
  "myAppUniqueStorageKey", // Required: A unique key for this store in Local Storage
  {
    // Optional: Custom serialization/deserialization
    stringify: (state) => JSON.stringify(state),
    parse: (storedString) => JSON.parse(storedString),
  }
);
```

Refer to the [Persist state](#persist-state) section for detailed configuration of each adapter.

## Use the API: Reference and examples

This section provides a comprehensive reference for the `@ibnlanre/portal` API, with detailed explanations and examples.

### Create stores: `createStore()`

The `createStore()` function is the primary way to initialize a new store.

**Syntax:**

```typescript
createStore<S>(initialState: S | Promise<S>): Store<S>
```

- **`initialState`**: The initial value for the store.
  - If a primitive value (string, number, boolean, etc.) is provided, a `PrimitiveStore` is created.
  - If an object is provided, a `CompositeStore` is created. Each property of the object becomes a nested store.
  - If a `Promise` is provided, the store will be initialized with the resolved value of the promise. The store will be empty until the promise resolves. The resolved value is treated as a single entity; if it's an object, it becomes the state of a primitive-like store, not a composite store with nested properties.
- **Returns**: A `Store` instance, which can be a `PrimitiveStore<S>` or `CompositeStore<S>` depending on `initialState`.

**Examples:**

1.  **Creating a primitive store:**

    ```typescript
    import { createStore } from "@ibnlanre/portal";

    const countStore = createStore(0);
    console.log(countStore.$get()); // Output: 0

    const messageStore = createStore("Hello, world!");
    console.log(messageStore.$get()); // Output: "Hello, world!"
    ```

2.  **Creating a composite store:**

    ```typescript
    import { createStore } from "@ibnlanre/portal";

    const userStore = createStore({
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
      },
    });

    console.log(userStore.name.$get()); // Output: "Alex Johnson"
    console.log(userStore.address.city.$get()); // Output: "Anytown"
    ```

3.  **Creating a store with asynchronous initialization:**

    ```typescript
    import { createStore } from "@ibnlanre/portal";

    async function fetchUserData(): Promise<{ id: number; name: string }> {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id: 1, name: "Fetched User" }), 1000);
      });
    }

    const userProfileStore = await createStore(fetchUserData());
    // The store is now initialized as a primitive store with the fetched data.
    // Note: userProfileStore holds { id: 1, name: "Fetched User" } as a single value.
    // It's not created as a composite store despite being an object.

    console.log(userProfileStore.$get()); // Output: { id: 1, name: "Fetched User" }
    ```

### Use store instance methods

All store instances, whether primitive or composite, provide a core set of methods for interacting with the state.

#### `$get()`

Retrieves the current state of the store. Optionally, you can provide a selector function to compute a derived value from the state without altering the stored state.

**Syntax:**

```typescript
$get(): S
$get<R>(selector: (currentState: S) => R): R
```

- **`selector`** (optional): A function that takes the current state (`S`) as an argument and returns a derived value (`R`).
- **Returns**: The current state (`S`) if no selector is provided, or the derived value (`R`) if a selector is provided.

**Examples:**

1.  **Getting the current state:**

    ```typescript
    const countStore = createStore(10);
    const currentCount = countStore.$get(); // 10

    const userStore = createStore({ name: "Alex", role: "admin" });
    const currentUser = userStore.$get(); // { name: "Alex", role: "admin" }
    const userName = userStore.name.$get(); // "Alex"
    ```

2.  **Getting a derived value using a selector:**

    ```typescript
    const countStore = createStore(10);
    const doubledCount = countStore.$get((count) => count * 2); // 20
    console.log(countStore.$get()); // 10 (original state is unchanged)

    const userStore = createStore({ firstName: "Alex", lastName: "Johnson" });
    const fullName = userStore.$get(
      (user) => `${user.firstName} ${user.lastName}`
    ); // "Alex Johnson"
    ```

#### `$set()`

Updates the store's state. You can pass a new value directly or provide an update function that receives the previous state and returns the new state.

For composite stores holding objects, `$set` performs a deep partial update. This means you only need to provide the properties you want to change, and `@ibnlanre/portal` will merge them intelligently with the existing state.

**Syntax:**

```typescript
$set(newValue: S): void
$set(updater: (prevState: S) => S): void
```

- **`newValue`**: The new state value to set directly.
- **`updater`**: A function that takes the previous state (`S`) as an argument and returns the new state (`S`).
- **Returns**: `void`.

**Examples:**

1.  **Setting a new value directly (Primitive Store):**

    ```typescript
    const countStore = createStore(0);
    countStore.$set(5);
    console.log(countStore.$get()); // 5
    ```

2.  **Updating using a function (Primitive Store):**

    ```typescript
    const countStore = createStore(5);
    countStore.$set((prevCount) => prevCount + 1);
    console.log(countStore.$get()); // 6
    ```

3.  **Partial update on a Composite Store:**

    ```typescript
    const settingsStore = createStore({
      theme: "light",
      fontSize: 12,
      notifications: true,
    });

    // Update only theme and fontSize; notifications is preserved.
    settingsStore.$set({ theme: "dark", fontSize: 14 });
    // settingsStore.$get() is now { theme: "dark", fontSize: 14, notifications: true }

    // Functional partial update
    settingsStore.$set((prevSettings) => ({
      ...prevSettings, // Spread previous settings to preserve unspecified ones
      fontSize: prevSettings.fontSize + 2, // Only update fontSize
    }));
    // settingsStore.$get() is now { theme: "dark", fontSize: 16, notifications: true }
    ```

4.  **Updating nested properties in a Composite Store:**

    ```typescript
    const userStore = createStore({
      profile: { name: "Alex", age: 30 },
      role: "user",
    });

    // Update nested property directly
    userStore.profile.name.$set("Alexandra");
    console.log(userStore.profile.name.$get()); // "Alexandra"

    // Update part of the nested object
    userStore.profile.$set({ age: 31 }); // name is preserved
    // userStore.profile.$get() is { name: "Alexandra", age: 31 }
    ```

**Note on arrays:** When a part of your state is an array, and you use `$set` on the parent object containing that array, the entire array will be replaced if it's part of the update object. To modify array elements (e.g., add or remove items), access the array store directly or use functional updates on that specific array store.

```typescript
const listStore = createStore({ items: [1, 2, 3], name: "My List" });

// This replaces the entire 'items' array but preserves 'name'.
listStore.$set({ items: [4, 5, 6] });
// listStore.$get() is { items: [4, 5, 6], name: "My List" }

// To add an item, update the 'items' store directly.
listStore.items.$set((prevItems) => [...prevItems, 7]);
// listStore.items.$get() is now [4, 5, 6, 7]
```

#### `$act()`

Subscribes a callback function to state changes. The callback receives the new state (and optionally the old state) whenever it changes. This method returns an `unsubscribe` function to stop listening for updates.

By default, the callback is invoked immediately with the current state upon subscription. To prevent this initial invocation, pass `false` as the second argument.

**Syntax:**

```typescript
$act(subscriber: (newState: S, oldState?: S) => void, immediate?: boolean): () => void
```

- **`subscriber`**: A function that is called when the state changes. It receives `newState` and optionally `oldState`.
- **`immediate`** (optional, default `true`): If `true`, the `subscriber` is called immediately with the current state. If `false`, it's only called on subsequent changes. (On the initial immediate call, `oldState` is `undefined`.)
- **Returns**: An `unsubscribe` function. Call this function to remove the subscription.

**Examples:**

1.  **Basic subscription:**

    ```typescript
    const nameStore = createStore("Alex");

    const unsubscribe = nameStore.$act((newName, oldName) => {
      console.log(`Name changed from "${oldName}" to "${newName}"`);
    });
    // Immediately logs: Name changed from "undefined" to "Alex"
    // (oldState is undefined on the initial call if immediate: true)

    nameStore.$set("Jordan"); // Logs: Name changed from "Alex" to "Jordan"

    unsubscribe(); // Stop listening to changes
    nameStore.$set("Casey"); // Nothing is logged
    ```

2.  **Subscription without immediate callback execution:**

    ```typescript
    const statusStore = createStore("idle");

    const unsubscribeNonImmediate = statusStore.$act((newStatus) => {
      console.log(`Status updated to: ${newStatus}`);
    }, false); // `false` prevents immediate call

    statusStore.$set("active"); // Logs: "Status updated to: active"
    unsubscribeNonImmediate();
    ```

3.  **Subscribing to a composite store:**

    ```typescript
    const settingsStore = createStore({ theme: "light", volume: 70 });
    const unsubscribeSettings = settingsStore.$act((newSettings) => {
      console.log("Settings updated:", newSettings);
    });
    // Immediately logs: Settings updated: { theme: "light", volume: 70 }

    settingsStore.theme.$set("dark");
    // Logs: Settings updated: { theme: "dark", volume: 70 }
    unsubscribeSettings();
    ```

#### `$key()`

(CompositeStore only) Provides convenient access to deeply nested stores using a dot-separated string path. This method returns the nested store instance, allowing you to use its methods (`$get`, `$set`, `$act`, `$use`, `$key`) directly.

**Syntax:**

```typescript
$key<N extends Store<any>>(path: string): N
```

- **`path`**: A dot-separated string representing the path to the nested store (e.g., `"user.preferences.theme"`). TypeScript provides autocompletion for valid paths.
- **Returns**: The nested `Store` instance (`N`).

**Examples:**

```typescript
const appStore = createStore({
  user: {
    profile: {
      name: "Alex",
      email: "alex@example.com",
    },
    preferences: {
      theme: "dark",
      language: "en",
    },
  },
  status: "active",
});

// Access nested stores using $key
const themeStore = appStore.$key("user.preferences.theme");
console.log(themeStore.$get()); // "dark"

themeStore.$set("light");
console.log(appStore.user.preferences.theme.$get()); // "light" (state is synced)

// $key can be used on intermediate stores as well
const preferencesStore = appStore.user.$key("preferences");
const languageStore = preferencesStore.$key("language"); // Equivalent to appStore.$key("user.preferences.language")
console.log(languageStore.$get()); // "en"

// Using methods on the store returned by $key
const unsubscribeTheme = appStore
  .$key("user.preferences.theme")
  .$act((newTheme) => {
    console.log("Theme via $key:", newTheme);
  });
appStore.user.preferences.theme.$set("blue"); // Triggers the subscription
unsubscribeTheme();
```

#### `$use()` (React Hook)

Connects your React components to an `@ibnlanre/portal` store. It works like React's `useState` hook, returning a tuple with the current state value (or a derived value) and a function to update the store's state.

The `$use` hook automatically subscribes the component to store changes and unsubscribes when the component unmounts, ensuring efficient re-renders.

**Syntax:**

```typescript
$use(): [S, (newValue: S | ((prevState: S) => S)) => void]
$use<R>(
  selector: (currentState: S) => R,
  dependencies?: any[]
): [R, (newValue: S | ((prevState: S) => S)) => void]
```

- **`selector`** (optional): A function that takes the current store state (`S`) and returns a transformed value (`R`) for the component.
- **`dependencies`** (optional): An array of dependencies for the `selector` function. The selector is re-evaluated if any of these dependencies change (similar to `React.useMemo`).
- **Returns**: A tuple:
  1.  `currentStateOrDerivedValue`: The current state (`S`) or the value returned by the `selector` (`R`).
  2.  `setStateFunction`: A function to update the store's state. It accepts either a new value of type `S` or an updater function `(prevState: S) => S`.

**Examples:**

1.  **Basic usage in a React component:**

    ```tsx
    // src/stores/counterStore.ts
    import { createStore } from "@ibnlanre/portal";
    export const counterStore = createStore(0);

    // src/components/Counter.tsx
    import React from "react";
    import { counterStore } from "../stores/counterStore";

    function Counter() {
      const [count, setCount] = counterStore.$use();

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
          <button onClick={() => setCount((prev) => prev - 1)}>
            Decrement
          </button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>
      );
    }
    export default Counter;
    ```

2.  **Using a selector with `$use`:**

    ```tsx
    // In your component:
    // Assume counterStore holds a number.
    const [displayCount, setCount] = counterStore.$use(
      (currentCount) => `Current count is: ${currentCount}`
    );
    // If counterStore holds 0, displayCount is "Current count is: 0".
    // setCount still expects a number to update the original counterStore.

    return <p>{displayCount}</p>;
    ```

3.  **Using a selector with dependencies:**

    ```tsx
    import React, { useState } from "react";
    import { someStore } from "../stores/someStore"; // Assume someStore holds a string

    function DisplayValue({ prefixFromProp }: { prefixFromProp: string }) {
      const [displayValue, setValueInStore] = someStore.$use(
        (storeValue) => `${prefixFromProp}${storeValue}`,
        [prefixFromProp] // Selector re-runs if prefixFromProp changes
      );

      return (
        <div>
          <p>{displayValue}</p>
          <input
            type="text"
            value={someStore.$get()} // For controlled input, get raw value
            onChange={(e) => setValueInStore(e.target.value)}
          />
        </div>
      );
    }
    ```

4.  **Partial updates with objects using `$use`:**
    When a store (or a part of a store accessed via `$use`) holds an object, the `setState` function returned by `$use` supports partial updates. Provide an object with only the properties you want to change.

    ```tsx
    // store.ts
    import { createStore } from "@ibnlanre/portal";
    export const userStore = createStore({
      name: "Alex",
      age: 30,
      city: "Anytown",
    });

    // Component.tsx
    import React from "react";
    import { userStore } from "./store";

    function UserProfile() {
      const [user, setUser] = userStore.$use();

      const handleAgeIncrease = () => {
        setUser({ age: user.age + 1 }); // Only age is updated; name and city are preserved.
      };

      const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ name: event.target.value }); // Only name is updated.
      };

      return (
        <div>
          <input type="text" value={user.name} onChange={handleNameChange} />
          <p>Age: {user.age}</p>
          <p>City: {user.city}</p>
          <button onClick={handleAgeIncrease}>Increase Age</button>
        </div>
      );
    }
    ```

### Define actions: Functions in stores

You can include functions within the initial state object of a composite store. These functions become methods on the store, allowing you to co-locate state logic (actions) with the state itself. This is useful for encapsulating complex state transitions.

When defining actions, to update state, you must use the variable that holds the store instance. For example, if your store is `const myStore = createStore(...)`, you would use `myStore.someProperty.$set(...)` inside an action, not `this.someProperty.$set(...)`.

**Examples:**

1.  **Counter with actions:**

    ```typescript
    import { createStore } from "@ibnlanre/portal";

    const counterStore = createStore({
      value: 0,
      increment(amount: number = 1) {
        // To update 'value', use 'counterStore.value'
        counterStore.value.$set((prev) => prev + amount);
      },
      decrement(amount: number = 1) {
        counterStore.value.$set((prev) => prev - amount);
      },
      reset() {
        counterStore.value.$set(0);
      },
    });

    counterStore.increment(5);
    console.log(counterStore.value.$get()); // 5

    counterStore.decrement();
    console.log(counterStore.value.$get()); // 4

    counterStore.reset();
    console.log(counterStore.value.$get()); // 0
    ```

2.  **Reducer pattern:**
    You can structure actions to follow a reducer pattern if that fits your application's architecture.

    ```typescript
    import { createStore } from "@ibnlanre/portal";

    type CounterAction =
      | { type: "INCREMENT"; payload: number }
      | { type: "DECREMENT"; payload: number }
      | { type: "RESET" };

    const dispatchingCounterStore = createStore({
      value: 0,
      dispatch(action: CounterAction) {
        switch (action.type) {
          case "INCREMENT":
            // Use 'dispatchingCounterStore.value' to access $set
            dispatchingCounterStore.value.$set((prev) => prev + action.payload);
            break;
          case "DECREMENT":
            dispatchingCounterStore.value.$set((prev) => prev - action.payload);
            break;
          case "RESET":
            dispatchingCounterStore.value.$set(0);
            break;
        }
      },
    });

    dispatchingCounterStore.dispatch({ type: "INCREMENT", payload: 5 });
    console.log(dispatchingCounterStore.value.$get()); // 5

    dispatchingCounterStore.dispatch({ type: "RESET" });
    console.log(dispatchingCounterStore.value.$get()); // 0
    ```

### Actions as hooks

`@ibnlanre/portal` allows you to define functions within your store that can be used as React custom hooks. This powerful feature enables you to co-locate complex, stateful logic—including side effects managed by `useEffect` or component-level state from `useState`—directly with the store it relates to.

To create an action that functions as a hook, simply follow React's convention: prefix the function name with `use`, place it directly within the object you pass to createStore, then use it like any regular custom hook in your React components.

This pattern leverages React's own rules for hooks. It doesn't prevent the function from being recreated on re-renders (which is normal React behavior), but it provides an excellent way to organize and attach reusable hook logic to your store instance.

> ⚠️ Note: These functions aren’t automatically memoized. Make sure your store is created once at the module level, and not within a component, to avoid re-creating the hook logic on every render.

**Example:**

Let's create a store with an action that uses `useState` and `useEffect` to automatically reset a message after a delay.

```typescript
import { createStore } from "@ibnlanre/portal";
import { useState, useEffect } from "react";

export const notificationStore = createStore({
  message: "",
  setMessage(newMessage: string) {
    notificationStore.message.$set(newMessage);
  },
  useAutoResetMessage(initialMessage: string, delay: number) {
    const [internalMessage, setInternalMessage] = useState(initialMessage);

    useEffect(() => {
      if (internalMessage) {
        const timer = setTimeout(() => {
          setInternalMessage("");
        }, delay);
        return () => clearTimeout(timer);
      }
    }, [internalMessage, delay]);

    useEffect(() => {
      notificationStore.message.$set(internalMessage);
    }, [internalMessage]);

    return [internalMessage, setInternalMessage] as const;
  },
});
```

**Using the hook action in a component:**

```tsx
import { notificationStore } from "../stores/notification-store";

export function NotificationManager() {
  const [message, setMessage] = notificationStore.useAutoResetMessage(
    "Welcome!",
    3000
  );

  const [globalMessage] = notificationStore.message.$use();

  return (
    <div>
      <p>Current message (from hook state): {message}</p>
      <p>Global message (from store): {globalMessage}</p>
      <button onClick={() => setMessage("Resetting in 3 seconds")}>
        Set Temporary Message
      </button>
    </div>
  );
}
```

In this example, `useAutoResetMessage` encapsulates its own state and side effects, just like a custom React hook, while still being able to interact with the global store. This pattern allows you to:

- Reuse complex hook logic across components
- Co-locate logic with the state it touches
- Maintain a clean separation of concern between logic and UI

### Combine stores and actions: `combine()`

The `combine()` utility performs a deep merge between two objects. It's useful for unifying your initial state and actions into one cohesive structure before passing it into createStore.

Unlike shallow merging (such as Object.assign or object spread), `combine()`:

- Recursively merges nested objects
- Preserves store instances within deeply nested structures
- Handles circular references safely

However, `combine()` does not automatically bind the store reference to your actions. If your actions need access to the store, they must reference it manually—so they should be defined inline when calling combine() and not imported separately.

**Syntax:**

```typescript
combine<Target extends Dictionary, Source>(target: Target, source: Source): Merge<Target, Source>
```

- **`target`**: Base state or object.
- **`source`**: Object containing actions or additional properties to merge.
- **Returns**:A new, deeply merged object with references preserved.

**Example:**

Let's define state and actions separately and then combine them into a single store.

```typescript
import { createStore, combine } from "@ibnlanre/portal";

// 1. Define initial state
const initialState = {
  profile: {
    name: "Alex",
    email: "alex@example.com",
  },
  isLoggedIn: false,
};

// 2. Use combine to merge state and inline actions
export const userStore = createStore(
  combine(initialState, {
    login(email: string) {
      userStore.$set({
        profile: {
          ...userStore.profile.$get(),
          email,
        },
        isLoggedIn: true,
      });
    },
    logout() {
      userStore.$set({
        profile: { name: "", email: "" },
        isLoggedIn: false,
      });
    },
    updateName(newName: string) {
      userStore.profile.name.$set(newName);
    },
  })
);
```

Once your store is set up, you can use the state and actions like this:

```typescript
// Now you can use the store with both state and actions
userStore.login("alex@example.com");
console.log(userStore.profile.email.$get()); // "alex@example.com"

userStore.updateName("Alexandra");
console.log(userStore.profile.name.$get()); // "Alexandra"
```

This approach allows you to keep your state and actions organized in one place, making it easier to manage complex stores. It also ensures that your actions have access to the store instance, allowing them to update the state correctly.

### Initialize state asynchronously

You can initialize a store with state fetched asynchronously by passing an `async` function (that returns a `Promise`) to `createStore`. The store will initially be empty (or hold the unresolved Promise object itself, depending on internal handling) until the Promise resolves.

**Important Considerations:**

- The store's methods (`$get`, `$set`, `$act`, `$use`) will operate on the unresolved Promise or an initial empty state until resolution.
- If the Promise resolves to an object, this object is treated as a single (primitive-like) value within the store. To achieve a nested structure from async data, initialize the store with a placeholder structure (or `null`) and then update it using `$set` once the data is fetched.
- For complex or relational data, consider normalizing the data shape or using `normalizeObject` before store initialization.

**Example:**

```typescript
import { createStore } from "@ibnlanre/portal";

interface UserData {
  id: number;
  name: string;
  email: string;
}

async function fetchInitialData(): Promise<UserData> {
  // Simulate API call
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ id: 1, name: "Lyn", email: "lyn@example.com" }),
      500
    )
  );
}

const userStore = await createStore(fetchInitialData());
// At this point, the promise has resolved, and the store is initialized.
const userData = userStore.$get();
console.log(userData); // { id: 1, name: "Lyn", email: "lyn@example.com" }

// userData is a single object. userStore.id does not exist as a sub-store.
// To update, you'd set the whole object:
userStore.$set({ id: 2, name: "Alex", email: "alex@example.com" });
```

If you need a nested store structure from asynchronously loaded data, initialize the store with a placeholder structure (or `null`) and then update it using `$set` once the data is fetched. This allows the composite store structure to be established correctly.

```typescript
import { createStore } from "@ibnlanre/portal";

interface AppData {
  user: { name: string; role: string } | null;
  settings: { theme: string } | null;
  loading: boolean;
}

const appDataStore = createStore<AppData>({
  user: null,
  settings: null,
  loading: true,
});

async function loadAppData() {
  try {
    // const fetchedData = await fetchActualDataFromAPI();
    const fetchedData = {
      // Example fetched data
      user: { name: "Sam", role: "admin" },
      settings: { theme: "dark" },
    };
    appDataStore.$set({ ...fetchedData, loading: false });

    // Now appDataStore.user.name.$get() would work.
    console.log(appDataStore.user.name.$get()); // "Sam"
  } catch (error) {
    console.error("Failed to load app data:", error);
    appDataStore.$set({ user: null, settings: null, loading: false }); // Handle error state
  }
}

loadAppData();
```

### Handle circular references

`@ibnlanre/portal` handles objects with circular references safely during store creation and operations. This is particularly useful for complex data structures, such as graphs or when working with certain browser objects (after normalization).

**Example:**

```typescript
import { createStore } from "@ibnlanre/portal";

// Define a type for clarity
interface Node {
  name: string;
  connections: Node[];
  metadata?: { type: string };
}

const nodeA: Node = {
  name: "A",
  connections: [],
  metadata: { type: "root" },
};
const nodeB: Node = {
  name: "B",
  connections: [],
  metadata: { type: "leaf" },
};

nodeA.connections.push(nodeB); // nodeA points to nodeB
nodeB.connections.push(nodeA); // nodeB points back to nodeA (circular reference)

const graphStore = createStore({
  nodes: [nodeA, nodeB], // 'nodes' is an array of Node objects
  selectedNode: nodeA, // 'selectedNode' is a Node object
});

// Accessing data:
// 1. For 'selectedNode' (a direct object property, so it and its properties are stores)
console.log(graphStore.selectedNode.name.$get()); // "A"

if (graphStore.selectedNode.metadata) {
  // Check if metadata exists
  console.log(graphStore.selectedNode.metadata.type.$get()); // "root"
}

// 2. For 'nodes' (an array property; elements are not individual stores)
const currentNodes = graphStore.nodes.$get(); // Get the array value

// Access properties of objects within the 'currentNodes' array
console.log(currentNodes[0].name); // "A" (Accessing nodeA.name directly)
console.log(currentNodes[0].connections[0].name); // "B" (Accessing nodeA.connections[0].name which is nodeB.name)

// Demonstrating the circular reference is preserved:
console.log(currentNodes[0].connections[0].connections[0].name); // "A" (nodeA -> nodeB -> nodeA)

// Updates also work correctly:
// Update via 'selectedNode' store
graphStore.selectedNode.name.$set("Node Alpha");
console.log(graphStore.selectedNode.name.$get()); // "Node Alpha"

// The original nodeA object (referenced by selectedNode and within the nodes array) is updated
console.log(nodeA.name); // "Node Alpha"

// Verify in the array retrieved from the store
const updatedNodes = graphStore.nodes.$get();
console.log(updatedNodes[0].name); // "Node Alpha"

// If you were to update an element within the 'nodes' array, you'd do it like this:
graphStore.nodes.$set((prevNodes) => {
  const newNodes = [...prevNodes];

  // Example: Change name of the second node (nodeB)
  if (newNodes[1]) {
    newNodes[1] = { ...newNodes[1], name: "Node Beta" };
  }

  return newNodes;
});

// Assuming nodeB was correctly updated in the array:
const finalNodes = graphStore.nodes.$get();

if (finalNodes[1]) {
  console.log(finalNodes[1].name); // Should be "Node Beta"
}

// And the original nodeB object is also updated if its reference was maintained
console.log(nodeB.name); // "Node Beta"
```

### Handle arrays in stores

When your store's state includes arrays, `@ibnlanre/portal` treats them in a specific way:

- **Arrays as store properties**: If an array is a direct property of your initial state object (e.g., `items: [1, 2, 3]` in `createStore({ items: [...] })`), then `store.items` becomes a store instance that manages this array. You can use `$get()`, `$set()`, and `$act()` on `store.items` to interact with the entire array.

  ```typescript
  const store = createStore({ tags: ["typescript", "state-management"] });
  const currentTags = store.tags.$get(); // ['typescript', 'state-management']
  store.tags.$set(["javascript", "react"]); // Replaces the array
  ```

- **Elements within arrays are not individual stores**: Objects or other values _inside_ an array are treated as plain data. They are not automatically wrapped as individual store instances. This means you cannot call store methods like `$get()` or `$set()` directly on an array element, even if that element is an object.

  ```typescript
  const store = createStore({
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
  });

  // Correct: Get the array, then access elements
  const usersArray = store.users.$get();
  const firstUserName = usersArray[0].name; // "Alice"

  // Incorrect: Attempting to treat an array element as a store
  const firstUserStore = store.users[0]; // This is not how to access it
  const name = store.users[0].name.$get(); // This will cause an error
  ```

- **Updating arrays**:

  - To replace the entire array, use `$set()` on the array's store property:
    ```typescript
    const listStore = createStore({ items: [1, 2, 3] });
    listStore.items.$set([4, 5, 6]);
    console.log(listStore.items.$get()); // Output: [4, 5, 6]
    ```
  - To modify the array (e.g., add, remove, or update elements), use a functional update with `$set()` on the array's store property. This ensures immutability by creating a new array.

    ```typescript
    const userListStore = createStore({
      users: [{ id: 1, name: "Alex", details: { age: 30 } }],
    });

    // Add a new user
    userListStore.users.$set((currentUsers) => [
      ...currentUsers,
      { id: 2, name: "Jordan", details: { age: 25 } },
    ]);

    // Update an existing user's name
    userListStore.users.$set((currentUsers) =>
      currentUsers.map((user) =>
        user.id === 1 ? { ...user, name: "Alexandra" } : user
      )
    );
    // To update a nested property within an object in an array:
    userListStore.users.$set((currentUsers) =>
      currentUsers.map((user) =>
        user.id === 1
          ? { ...user, details: { ...user.details, age: 31 } }
          : user
      )
    );
    ```

- **Arrays of primitive values**: These are handled straightforwardly. The array itself is the store property.

  ```typescript
  const numberListStore = createStore({ ids: [101, 102, 103] });
  numberListStore.ids.$set((prevIds) => [...prevIds, 104]);
  ```

This behavior ensures that arrays are managed predictably as collections, while direct object properties of a store are augmented for more granular control. If you require each item in a collection to have full store capabilities, consider structuring your state as an object mapping IDs to individual stores, rather than an array of items. For example:

```typescript
const itemStores = createStore({
  item_1: { name: "Item A", stock: 10 },
  item_2: { name: "Item B", stock: 5 },
});
// Now itemStores.item_1 is a store, itemStores.item_1.name is a store, etc.
```

### Normalize objects: `normalizeObject()`

The `normalizeObject()` function converts interface-typed objects (like `window`, DOM elements, or complex API responses that might not be plain JavaScript objects) into dictionary types (`Record<PropertyKey, unknown>`) compatible with composite stores. This is important when an object's structure includes methods, symbols, or other non-serializable parts that shouldn't be part of the reactive state, or when TypeScript's type system for interfaces doesn't align with the expected structure for a composite store.

`normalizeObject` helps by:

- Converting interface types to store-compatible dictionary types.
- Converting interface types to store-compatible dictionary types.
- Safely handling circular references within the object during normalization.
- Filtering out non-data properties like functions and Symbols.
- Only preserving properties with string or number keys (symbol keys are excluded).
- Preserving the accessible data structure of the original object.

**Important**: The normalized object will only contain properties with string or number keys. Symbol keys are excluded during normalization.

**Syntax:**

```typescript
normalizeObject<T extends object>(obj: T): Record<PropertyKey, unknown> // Simplified, actual return might be more specific
```

- **`obj`**: The object to normalize.
- **Returns**: A new object that is a "plain" JavaScript object representation of `obj`, suitable for `createStore`.

**Examples:**

1.  **Normalizing the browser's `window` object:**

    ```typescript
    import { createStore, normalizeObject } from "@ibnlanre/portal";

    // The 'window' object is complex and has an interface type.
    // Normalizing it makes it suitable for a composite store.
    const normalizedWindow = normalizeObject(window);
    const browserInfoStore = createStore(normalizedWindow);

    // Now you can access properties like browserInfoStore.navigator.userAgent.$get()
    // Note: Functions on window (like alert) would typically be excluded by normalization.
    console.log(browserInfoStore.location.href.$get());

    // This might work if 'document' is data-like
    console.log(browserInfoStore.document.title.$get());
    ```

2.  **Normalizing a custom interface with methods and symbols:**

    ```typescript
    import { createStore, normalizeObject } from "@ibnlanre/portal";

    interface UserProfileAPI {
      id: number;
      getFullName(): string; // A method
      lastLogin: Date;
      internalConfig: symbol; // A symbol
      data: { value: string };
    }

    const apiResponse: UserProfileAPI = {
      id: 123,
      getFullName: () => "Alex Doe",
      lastLogin: new Date(),
      internalConfig: Symbol("config"),
      data: { value: "test" },
    };

    const normalizedUserProfile = normalizeObject(apiResponse);
    /*
      normalizedUserProfile will be:
      {
        id: 123,
        lastLogin: // Date object (preserved as it's data-like)
        data: { value: "test" }
      }
      // The getFullName method and internalConfig symbol are removed by normalization,
      // as functions and symbol keys are filtered out.
    */

    const userProfileStore = createStore(normalizedUserProfile);
    console.log(userProfileStore.id.$get()); // 123
    console.log(userProfileStore.data.value.$get()); // "test"

    // userProfileStore.getFullName is undefined (method was stripped)
    // userProfileStore.internalConfig is undefined (symbol key was excluded)
    ```

### Infer state types: `InferType`

The `InferType` utility type allows you to extract TypeScript types from your Portal stores. This is especially useful when you need to work with the underlying state type in other parts of your application, such as API calls, form validation, or when passing state to other components.

**Syntax:**

```typescript
InferType<Store, Path?>;
```

**Parameters:**

- **`Store`**: The store from which to infer the type (must extend `PrimitiveStore<any>`)
- **`Path`** (optional): A path within the store's state to extract a specific nested type

**Returns**: The TypeScript type of the store's state, or the type at the specified path

**Examples:**

1. **Infer the complete state type:**

   ```typescript
   import { createStore, InferType } from "@ibnlanre/portal";

   const userStore = createStore({
     name: "Alice",
     age: 30,
     preferences: {
       theme: "dark",
       notifications: true,
     },
   });

   // Extract the full state type
   type UserState = InferType<typeof userStore>;
   /*
   UserState is:
   {
     name: string;
     age: number;
     preferences: {
       theme: string;
       notifications: boolean;
     };
   }
   */

   // Use the inferred type in functions
   function saveUserToAPI(user: UserState) {
     // API call with properly typed user data
     return fetch("/api/users", {
       method: "POST",
       body: JSON.stringify(user),
     });
   }

   // Get the current state with correct typing
   const currentUser = userStore.$get(); // Type is automatically UserState
   saveUserToAPI(currentUser);
   ```

2. **Infer specific nested types:**

   ```typescript
   import { createStore, InferType } from "@ibnlanre/portal";

   const appStore = createStore({
     user: {
       profile: {
         name: "Bob",
         email: "bob@example.com",
       },
       settings: {
         theme: "light",
         language: "en",
       },
     },
     data: {
       posts: [],
       comments: [],
     },
   });

   // Extract specific nested types
   type UserProfile = InferType<typeof appStore, "user.profile">;
   // UserProfile is: { name: string; email: string; }

   type UserSettings = InferType<typeof appStore, "user.settings">;
   // UserSettings is: { theme: string; language: string; }

   type AppData = InferType<typeof appStore, "data">;
   // AppData is: { posts: any[]; comments: any[]; }

   // Use inferred types for type-safe operations
   function updateProfile(newProfile: Partial<UserProfile>) {
     appStore.user.profile.$set((current) => ({ ...current, ...newProfile }));
   }

   function updateSettings(settings: UserSettings) {
     appStore.user.settings.$set(settings);
   }
   ```

3. **Use with primitive stores:**

   ```typescript
   import { createStore, InferType } from "@ibnlanre/portal";

   const countStore = createStore(0);
   const nameStore = createStore("Hello");
   const itemsStore = createStore<string[]>([]);

   type CountType = InferType<typeof countStore>; // number
   type NameType = InferType<typeof nameStore>; // string
   type ItemsType = InferType<typeof itemsStore>; // string[]

   // Use inferred types in function parameters
   function processCount(value: CountType) {
     console.log(`Processing count: ${value}`);
   }

   function processItems(items: ItemsType) {
     return items.map((item) => item.toUpperCase());
   }
   ```

4. **Integration with forms and validation:**

   ```typescript
   import { createStore, InferType } from "@ibnlanre/portal";

   const formStore = createStore({
     username: "",
     email: "",
     profile: {
       firstName: "",
       lastName: "",
       bio: "",
     },
   });

   type FormData = InferType<typeof formStore>;
   type ProfileData = InferType<typeof formStore, "profile">;

   // Type-safe form validation
   function validateForm(data: FormData): boolean {
     return (
       data.username.length > 0 &&
       data.email.includes("@") &&
       data.profile.firstName.length > 0
     );
   }

   // Type-safe API integration
   async function submitForm(formData: FormData) {
     const response = await fetch("/api/register", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(formData),
     });
     return response.json();
   }

   // Usage
   const currentFormData = formStore.$get();
   if (validateForm(currentFormData)) {
     await submitForm(currentFormData);
   }
   ```

The `InferType` utility ensures type safety when working with store data outside of the reactive context, making it easier to integrate Portal stores with other parts of your TypeScript application.

## Persist state

`@ibnlanre/portal` allows you to persist store state across sessions using storage adapters. These adapters provide `getState` and `setState` functions that you integrate with your store.

#### Web Storage adapters

Use `createLocalStorageAdapter` or `createSessionStorageAdapter` to persist in the browser's Local Storage or Session Storage.

**Syntax:**

```typescript
createLocalStorageAdapter<State>(key: string, options?: StorageAdapterOptions<State>)
createSessionStorageAdapter<State>(key: string, options?: StorageAdapterOptions<State>)
```

**Parameters:**

- `key: string`: **Required**. A unique string identifying this store's data in web storage.
- `options?: StorageAdapterOptions<State>`: Optional configuration object with:
  - `stringify?: (state: State) => string`: Function to serialize the state before saving. Defaults to `JSON.stringify`.
  - `parse?: (storedString: string) => State`: Function to deserialize the state after loading. Defaults to `JSON.parse`.

**Return Value:**
Both adapters return a tuple: `[getStateFunction, setStateFunction]`.

- `getStateFunction(): S | null`: Retrieves the state from storage. Returns `null` if no state is found for the key.
- `setStateFunction(newState: S): void`: Saves the new state to storage.

**1. `createLocalStorageAdapter`**
Persists state in `localStorage`. Data remains until explicitly cleared or removed by the user/browser.

**Example:**

```typescript
import { createStore, createLocalStorageAdapter } from "@ibnlanre/portal";

const localStorageAdapter = createLocalStorageAdapter("myAppCounter", {
  // Example with custom serialization (e.g., simple obfuscation)
  // stringify: (state) => btoa(JSON.stringify(state)),
  // parse: (storedString) => JSON.parse(atob(storedString)),
});

const [getStoredCounter, setStoredCounter] = localStorageAdapter;

// Load persisted state or use a default if nothing is stored
const initialCounterState = getStoredCounter(0); // Default to 0 if null
const persistentCounterStore = createStore(initialCounterState);

// Subscribe to store changes to save them to Local Storage
persistentCounterStore.$act((newState) => {
  setStoredCounter(newState);
}, false); // `false` prevents saving immediately on setup, only on actual changes

// Example usage:
persistentCounterStore.$set(10); // State is now 10 and saved to Local Storage
persistentCounterStore.$set((prev) => prev + 5); // State is 15 and saved
```

**2. `createSessionStorageAdapter`**
Persists state in `sessionStorage`. Data remains for the duration of the page session (until the browser tab is closed).

**Example:**

```typescript
import { createStore, createSessionStorageAdapter } from "@ibnlanre/portal";

const [getStoredSessionData, setStoredSessionData] =
  createSessionStorageAdapter("userSessionData");

const initialSessionData = getStoredSessionData({
  guestId: null,
  lastPage: "/",
});
const sessionDataStore = createStore(initialSessionData);

sessionDataStore.$act(setStoredSessionData, false);

// Example:
sessionDataStore.$set({ guestId: "guest-123", lastPage: "/products" });
// This data will be cleared when the tab is closed.
```

#### Cookie Storage adapter

Use `createCookieStorageAdapter` for persisting state in browser cookies.

**Syntax:**

```typescript
createCookieStorageAdapter<State>(key: string, options?: CookieStorageAdapterOptions<State>)
```

**Parameters:**

- `key: string`: **Required**. The name of the cookie.
- `options?: CookieStorageAdapterOptions<State>`: Optional configuration object with:
  - `secret?: string`: Secret string for signing and verifying cookies. If provided, cookies are tamper-proofed.
  - `stringify?: (state: State) => string`: Function to serialize the state. Defaults to `JSON.stringify`.
  - `parse?: (storedString: string) => State`: Function to deserialize the state. Defaults to `JSON.parse`.
  - Cookie attributes (`path`, `domain`, `secure`, `sameSite`, `maxAge`, etc.)
  - `path?: string`: Cookie path (e.g., `/`).
  - `domain?: string`: Cookie domain.
  - `maxAge?: number`: Max age in seconds (e.g., `3600 * 24 * 7` for 7 days).
  - `expires?: Date`: Expiration date.
  - `secure?: boolean`: If `true`, cookie is only sent over HTTPS.
  - `sameSite?: 'strict' | 'lax' | 'none'`: SameSite attribute.
- `stringify?` / `parse?`: Same as web storage adapters.

**Return Value:**
`[getCookieStateFunction, setCookieStateFunction]`

- `getCookieStateFunction(): S | null`: Retrieves and unsigns (if `secret` provided) the cookie value.
- `setCookieStateFunction(newState: S, newCookieOptions?: CookieOptions): void`: Signs (if `secret` provided) and sets the cookie. `newCookieOptions` can override initial options for this specific set.

**Example:**

```typescript
import { createStore, createCookieStorageAdapter } from "@ibnlanre/portal";

const cookieAdapter = createCookieStorageAdapter("appPreferences", {
  secret: "your-very-strong-secret-key-for-signing", // Recommended for security
  path: "/",
  secure: true,
  sameSite: "lax",
  maxAge: 3600 * 24 * 30, // 30 days
});

const [getCookiePrefs, setCookiePrefs] = cookieAdapter;

const initialPrefs = getCookiePrefs({
  theme: "light",
  notifications: true,
});
const prefsStore = createStore(initialPrefs);

prefsStore.$act((newPrefs) => {
  setCookiePrefs(newPrefs);

  // Example: Update maxAge on a specific change
  if (newPrefs.notifications === false) {
    setCookiePrefs(newPrefs, { maxAge: 3600 * 24 }); // Shorter expiry if notifications off
  }
}, false);

prefsStore.$set({ theme: "dark" }); // State saved to a signed cookie
```

**Signed cookies**: If you provide a `secret`, cookies are automatically signed before being set and verified when retrieved. This helps protect against client-side tampering.

#### Browser Storage adapter

For custom storage mechanisms (e.g., IndexedDB, a remote API, `chrome.storage`), use `createBrowserStorageAdapter`.

**Syntax:**

```typescript
createBrowserStorageAdapter<State>(
  key: string,
  options: BrowserStorageAdapterOptions<State>
): [
  getStorageState: GetBrowserStorage<State>,
  setStorageState: SetBrowserStorage<State>,
]
```

**Parameters:**

- `key: string`: **Required**. A key for your custom storage.
- `options: BrowserStorageAdapterOptions<State>`: **Required** configuration object with:
  - `getItem: (key: string) => string | null`: Function to retrieve an item.
  - `setItem: (key: string, value: string) => void`: Function to save an item.
  - `removeItem: (key: string) => void`: Function to remove an item.
  - `stringify?: (state: State) => string`: Function to serialize the state. Defaults to `JSON.stringify`.
  - `parse?: (storedString: string) => State`: Function to deserialize the state. Defaults to `JSON.parse`.

**Return Value:**
`[getStorageState, setStorageState]`

- `getStorageState(fallback?: State): State | undefined`
  - Retrieves the state from storage, applying the `parse` function.
  - If no state is found, it returns the provided fallback value.
- `setStorageState(value?: State): void`
  - Saves the state to storage, applying the `stringify` function.

**Example (using a simple in-memory object as custom storage):**

```typescript
import { createStore, createBrowserStorageAdapter } from "@ibnlanre/portal";

// Example custom storage (can be async)
const myCustomStorage = {
  data: {} as Record<string, string>,
  getItem(key: string) {
    this.data[key];
  },
  removeItem(key: string) {
    delete this.data[key];
  },
  setItem(key: string, value: string) {
    this.data[key] = value;
  },
};

const [getCustomState, setCustomState, removeCustomState] =
  createBrowserStorageAdapter("myCustomDataKey", {
    getItem: myCustomStorage.getItem,
    setItem: myCustomStorage.setItem,
    removeItem: myCustomStorage.removeItem,
  });

// Example usage (assuming synchronous custom storage for simplicity here)
const initialCustomData = getCustomState({ lastSync: null });
const customDataStore = createStore(initialCustomData);

customDataStore.$act(setCustomState, false);
customDataStore.$set({ lastSync: new Date().toISOString() });
```

#### Async Browser Storage adapter

The `createAsyncBrowserStorageAdapter` is a more flexible version of `createBrowserStorageAdapter`. It allows for asynchronous transformations of your state, which is useful when you need to perform operations like encryption, compression, or other async tasks before storing or retrieving the state.

The adapter provides two functions: one for getting the state from storage and another for setting the state to storage. Both functions can handle asynchronous operations, allowing you to work with data that requires processing before being used in your application.

**Syntax:**

```typescript
createAsyncBrowserStorageAdapter<State, StoredState>(
  key: string,
  options: AsyncBrowserStorageAdapterOptions<State, StoredState>
): [
  getStorageState: AsyncGetBrowserStorage<State>,
  setStorageState: AsyncSetBrowserStorage<State>,
]
```

**Parameters:**

- `key: string`: **Required**. A key for your custom storage.
- `options: BrowserStorageAdapterOptions<State>`: **Required** configuration object with:
  - `getItem: (key: string) => Promise<string | null> | string | null`: Function to retrieve an item.
  - `setItem: (key: string, value: string) => Promise<void> | void`: Function to save an item.
  - `removeItem: (key: string) => Promise<void> | void`: Function to remove an item.
  - `usageTransform`: A function that transforms the data **from** storage before it's used in your application.
  - `storageTransform`: A function that transforms the data **to** be stored.

**Return Value:**
`[getStorageState, setStorageState]`

- `getStorageState(fallback?: State): Promise<State | undefined>`
  - Retrieves the state from storage, applying the `usageTransform` function.
  - If no state is found, it returns the provided fallback value.
- `setStorageState(value?: State): Promise<void>`
  - Saves the state to storage, applying the `storageTransform` function.

**Example:**

Let's create an adapter that simulates async encryption and decryption.

```typescript
import { createAsyncBrowserStorageAdapter } from "@ibnlanre/portal";

// Simulate async encryption/decryption
async function encrypt(data: any): Promise<string> {
  return btoa(JSON.stringify(data));
}

async function decrypt(data: string): Promise<any> {
  return JSON.parse(atob(data));
}

const [getEncryptedState, setEncryptedState] = createAsyncBrowserStorageAdapter(
  "my-encrypted-store",
  {
    ...localStorage, // Use localStorage methods for simplicity
    storageTransform(data) {
      return btoa(JSON.stringify(data)); // Encrypt before storing
    },
    usageTransform(data) {
      return JSON.parse(atob(data)); // Decrypt when retrieving
    },
  }
);

// Now, you can use these functions to persist a store
const myStore = createStore(
  { sensitiveData: "secret" },
  {
    get: getEncryptedState,
    set: setEncryptedState,
  }
);

// When you set the state, it will be encrypted before being stored.
myStore.sensitiveData.$set("new secret");

// When the store is initialized, the data will be decrypted.
```

### Cookie Storage

Beyond the `createCookieStorageAdapter`, `@ibnlanre/portal` also exposes a `cookieStorage` module. This module provides a collection of utility functions for direct, granular manipulation of browser cookies. You might use these functions if you need to interact with cookies outside the context of a store or require more fine-grained control than the adapter offers.

These utilities are particularly helpful for tasks like signing/unsigning cookie values for security, directly reading or writing specific cookies, or managing cookie properties with precision.

**Access the module:**

To use these utilities, import `cookieStorage`:

```typescript
import { cookieStorage } from "@ibnlanre/portal";
```

The `cookieStorage` object provides the following functions and properties:

#### `sign()`

Signs a string value using a secret key. This is useful for creating tamper-proof cookie values.

- **Parameters**:
  - `value: string`: The string to sign.
  - `secret: string`: The secret key for signing.
- **Returns**: `string` - The signed string.
- **Example**:

  ```typescript
  const originalValue = "user-session-data";
  const secretKey = "your-super-secret-key";

  const signedValue = cookieStorage.sign(originalValue, secretKey);
  // signedValue might look like "user-session-data.asdfjklsemf..."
  ```

#### `unsign()`

Verifies and unsigns a previously signed string using the corresponding secret key.

- **Parameters**:
  - `signedValue: string`: The signed string to unsign.
  - `secret: string`: The secret key used for signing.
- **Returns**: `string | false` - The original string if the signature is valid, or `false` if tampering is detected or the secret is incorrect.
- **Example**:

  ```typescript
  const potentiallyTamperedValue = "user-session-data.asdfjklsemf...";
  const secretKey = "your-super-secret-key";

  const originalValue = cookieStorage.unsign(
    potentiallyTamperedValue,
    secretKey
  );

  if (originalValue === false) {
    console.error("Cookie signature is invalid!");
  } else {
    console.log("Original value:", originalValue);
  }
  ```

#### `getItem()`

Retrieves the value of a cookie by its name (key).

- **Parameters**:
  - `key: string`: The name of the cookie.
- **Returns**: `string | null` - The cookie's value, or `null` if the cookie is not found.
- **Example**:

  ```typescript
  const themePreference = cookieStorage.getItem("userTheme");

  if (themePreference) {
    console.log("User theme:", themePreference);
  }
  ```

#### `setItem()`

Sets or updates a cookie's value. You can also provide cookie options.

- **Parameters**:
  - `key: string`: The name of the cookie.
  - `value: string`: The value to store in the cookie.
  - `options?: CookieOptions`: Optional. An object specifying cookie attributes (e.g., `path`, `expires`, `secure`). Refer to the `CookieOptions` type definition for details.
- **Returns**: `void`
- **Example**:

  ```typescript
  cookieStorage.setItem("userToken", "abc123xyz789", {
    secure: true,
    path: "/",
    maxAge: 3600 * 24, // 1 day in seconds
  });
  ```

#### `removeItem()`

Removes a cookie by its name.

- **Parameters**:
  - `key: string`: The name of the cookie to remove.
  - `options?: CookieOptions`: Optional. Cookie options (like `path` and `domain`) that must match the options used when the cookie was set for successful removal.
- **Returns**: `void`
- **Example**:

  ```typescript
  cookieStorage.removeItem("userToken", { path: "/" });
  ```

#### `clear()`

Attempts to clear all cookies accessible to the current document's path and domain by setting their expiration date to the past. Note that this might not remove cookies set with specific `path` or `domain` attributes unless those are also iterated and cleared individually.

- **Returns**: `void`
- **Example**:

  ```typescript
  cookieStorage.clear(); // Clears cookies for the current path/domain
  ```

#### `createKey()`

Constructs a standardized cookie name string based on a set of provided options. This helps maintain consistent naming conventions for cookies across your application.

- **Parameters**: An object with the following optional properties:
  - `cookieFragmentDescription?: string`: A description for the cookie's purpose (e.g., "Authentication Token").
  - `cookiePrefix?: string`: A prefix for the cookie name (e.g., `"__Host-"`). Default: `""`.
  - `cookieFragmentSizes?: number[]`: Array defining sizes for fragments if the description is segmented. Default: `[]`.
  - `cookieScope?: string`: The scope of the cookie (e.g., "session", "user"). Default: `""`.
  - `cookieScopeCase?: "title" | "upper" | "lower" | "camel" | "snake" | "pascal" | "header" | "constant"`: The case formatting for the scope part. Default: `"title"`.
  - `cookieService?: string`: The service associated with the cookie. Default: `""`.
  - `cookieScopeServiceConnector?: string`: Connector between scope and service. Default: `"-"`.
  - `cookieScopeFragmentConnector?: string`: Connector between scope and fragment description. Default: `"_"`.
  - `cookieFragmentsConnector?: string`: Connector between multiple fragments of the description. Default: `""`.
  - `cookieSuffix?: string`: A suffix for the cookie name. Default: `""`.
- **Returns**: `string` - The generated cookie name.
- **Example**:

  ```typescript
  const authTokenKey = cookieStorage.createKey({
    cookieFragmentDescription: "Authentication Token",
    cookiePrefix: "__Secure-",
    cookieScope: "userSession",
    cookieScopeCase: "camel",
  });

  // authTokenKey might be "__Secure-userSession_AuthenticationToken"
  console.log(authTokenKey);
  ```

#### `key()`

Retrieves the name (key) of a cookie at a specific index in the document's cookie string. The order of cookies can be browser-dependent.

- **Parameters**:
  - `index: number`: The zero-based index of the cookie.
- **Returns**: `string | null` - The cookie name at the specified index, or `null` if the index is out of bounds.
- **Example**:

  ```typescript
  const firstCookieName = cookieStorage.key(0);

  if (firstCookieName) {
    console.log("Name of the first cookie:", firstCookieName);
  }
  ```

#### `length` (Property)

Retrieves the total number of cookies accessible to the current document.

- **Type**: `number`
- **Example**:

  ```typescript
  const numberOfCookies = cookieStorage.length;
  console.log(`There are ${numberOfCookies} cookies.`);
  ```

## Explore advanced usage

While `createStore()` is the recommended and most common way to create stores, `@ibnlanre/portal` also exports direct store creation functions for specific scenarios or finer control.

### Use direct store creation functions

#### `createPrimitiveStore()`

Creates a store specifically for a single, primitive value (string, number, boolean, null, undefined, symbol, bigint).

**Syntax:**

```typescript
createPrimitiveStore<S extends Primitives>(initialState: S): PrimitiveStore<S>
```

- **`initialState`**: The initial primitive value.
- **Returns**: A `PrimitiveStore<S>` instance.

**When to use:**

- When you are certain the state will always be a primitive value and want to be explicit.
- In rare cases where `createStore()` type inference for primitives might need disambiguation (though generally robust).

**Example:**

```typescript
import { createPrimitiveStore } from "@ibnlanre/portal";

const isActiveStore = createPrimitiveStore(false);
console.log(isActiveStore.$get()); // false

isActiveStore.$set(true);
```

#### `createCompositeStore()`

Creates a store specifically for an object, enabling nested state structures.

**Syntax:**

```typescript
createCompositeStore<S extends GenericObject>(initialState: S): CompositeStore<S>
```

- **`initialState`**: The initial object. Each property can become a nested store.
- **Returns**: A `CompositeStore<S>` instance.

**When to use:**

- When you are explicitly defining a store for an object structure.
- If you are building higher-level abstractions on top of the library and need direct access to composite store creation.

**Example:**

```typescript
import { createCompositeStore } from "@ibnlanre/portal";

const userDetailsStore = createCompositeStore({
  username: "guest",
  permissions: { read: true, write: false },
});

console.log(userDetailsStore.username.$get()); // "guest"
userDetailsStore.permissions.write.$set(true);
```

Using `createStore()` is generally preferred as it automatically determines whether to create a primitive or composite store based on the `initialState`.

## Optimize performance

`@ibnlanre/portal` is designed for performance, but here are some tips for optimal usage in complex applications:

- **Use selectors for reactive derived data**: When you need derived state that should update when dependencies change, use selectors with `$use()` that depend on the actual store state, not external variables.

  ```typescript
  // ✅ Correct: Selector depends on store state - updates reactively
  const [userItems] = appStore.$use((state) =>
    state.items.filter((item) => item.ownedBy === state.selectedUserId)
  );

  // ❌ Incorrect: External variable captured in closure - won't update
  const [userItems] = itemsStore.$use(
    (items) => items.filter((item) => item.ownedBy === selectedUserId) // selectedUserId is external
  );
  ```

- **Leverage dependency arrays for expensive computations**: When using selectors with `$use()`, provide a dependency array for expensive computations to prevent unnecessary recalculations.

  ```typescript
  // Expensive calculation with proper dependencies
  const [processedData] = store.$use(
    (state) => expensiveDataProcessing(state.rawData, complexConfig),
    [complexConfig] // Only re-run if complexConfig changes
  );
  ```

- **Choose the right approach for derived state**: Use different patterns based on your reactivity needs:

  ```typescript
  // For reactive derived state (updates components automatically)
  const [totalPrice] = cartStore.$use((cart) =>
    cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // For one-time calculations (doesn't subscribe to changes)
  const handleCheckout = () => {
    const total = cartStore.$get((cart) =>
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    processPayment(total);
  };
  ```

- **Avoid common reactivity pitfalls**:

  - **Don't use `useMemo` with incomplete dependencies**: If you use React's `useMemo` for derived state, ensure all store data is included in the dependency array.
  - **Don't capture external variables in selectors**: Selectors should depend only on the store state they receive as their parameter.
  - **Use store-level selectors for cross-store dependencies**: When deriving data from multiple stores, use a parent store that contains all the data.

- **Structure state for optimal updates**: Organize your state to minimize unnecessary re-renders:

  ```typescript
  // ✅ Good: Related data grouped together
  const uiStore = createStore({
    modals: { loginVisible: false, cartVisible: false },
    notifications: { count: 0, items: [] },
    theme: "dark",
  });

  // ❌ Less optimal: Separate stores for closely related UI state
  const loginModalStore = createStore(false);
  const cartModalStore = createStore(false);
  const notificationStore = createStore({ count: 0, items: [] });
  ```

- **Use granular subscriptions**: Subscribe only to the specific parts of state your component needs:

  ```typescript
  // ✅ Subscribe only to theme
  const [theme] = uiStore.theme.$use();

  // ❌ Subscribe to entire UI store when only theme is needed
  const [uiState] = uiStore.$use();
  const theme = uiState.theme;
  ```

- **Optimize array and collection handling**:

  - For large collections, consider pagination or virtualization at the component level.
  - Use functional updates to avoid recreating entire arrays when adding/removing items:

    ```typescript
    // Add item efficiently
    listStore.items.$set((prevItems) => [...prevItems, newItem]);

    // Remove item efficiently
    listStore.items.$set((prevItems) =>
      prevItems.filter((item) => item.id !== targetId)
    );
    ```

- **Batch related updates**: When making multiple related changes, batch them to prevent intermediate re-renders:

  ```typescript
  // ✅ Single update for related changes
  userStore.$set((prevUser) => ({
    ...prevUser,
    name: newName,
    email: newEmail,
    lastUpdated: Date.now(),
  }));

  // ❌ Multiple separate updates trigger multiple re-renders
  userStore.name.$set(newName);
  userStore.email.$set(newEmail);
  userStore.lastUpdated.$set(Date.now());
  ```

- **Optimize persistence operations**: For frequently changing state, debounce or throttle persistence to avoid performance costs:

  ```typescript
  const debouncedSave = debounce((state) => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, 1000);

  store.$act(debouncedSave, false);
  ```

- **Profile and measure**: Use React DevTools Profiler and browser performance tools to identify actual performance bottlenecks rather than premature optimization.

## Understand limitations

While `@ibnlanre/portal` is versatile, it's important to be aware of its limitations:

- **Serialization for persistence**: When using persistence adapters (localStorage, sessionStorage, cookies), the state must be serializable. Functions, Symbols, `undefined` (in some parts of objects when using `JSON.stringify`), or complex class instances might not serialize/deserialize correctly by default. Customize `stringify` and `parse` options in adapters for complex scenarios. Functions within stores (actions) are not persisted.
- **`normalizeObject()` behavior**: The `normalizeObject()` utility is designed to convert complex objects into plain data structures suitable for stores. It strips out functions and symbol keys, keeping only properties with string or number keys. If you need to retain functions or symbol properties, this utility is not suitable, and you'll need to handle them separately or use a different approach.
- **Reactivity scope**: Reactivity is triggered by changes to store values. If you mutate an object or array obtained via `$get()` directly (without using `$set()`), the store will not detect the change, and subscribers (including React components using `$use()`) will not update. Always use `$set()` or the updater function from `$use()` to modify state.
- **Promise resolution in `createStore`**: When `createStore` is initialized with a Promise, the resolved value is treated as a single entity. If the Promise resolves to an object, this object becomes the state of a primitive-like store, not a composite store with automatically created nested properties. To achieve a nested structure from async data, initialize the store with a placeholder and use `$set()` after data fetching.
- **Server-Side Rendering (SSR)**: While stores can be used in Node.js environments, managing state hydration and consistency in SSR setups requires careful consideration. The library itself doesn't provide out-of-the-box SSR-specific utilities beyond its core functionality.

## Follow best practices

To make the most of `@ibnlanre/portal`, consider these best practices:

- **Organize stores logically**:
  - **Feature-based**: Create stores related to specific features or domains of your application (e.g., `userStore`, `productStore`, `settingsStore`).
  - **UI state**: Separate stores for UI-specific state (e.g., `modalStore`, `notificationStore`) if it helps with clarity.
- **Keep state minimal**: Only store data that represents the actual state of your application. Derive computed values using selectors.
- **Embrace immutability**: Always use `$set()` or the updater from `$use()` to change state. Avoid direct mutations.
- **Co-locate actions**: Define actions (functions) within your composite stores to keep state logic close to the state it manages. This improves encapsulation and maintainability.
- **Use selectors for derived data**: Prevent redundant state and keep your stores lean by computing derived values on the fly.
  ```typescript
  const cartStore = createStore({ items: [{ price: 10, quantity: 2 }] });
  const totalCost = cartStore.$get((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  ```
- **Choose the right persistence adapter**:
  - `localStorage`: For persistent user preferences or data that should survive browser restarts.
  - `sessionStorage`: For temporary data related to a single session (e.g., form data, current tab state).
  - `cookieStorage`: For small pieces of data that need to be sent with HTTP requests or shared across subdomains, or when signed/secure cookies are needed.
- **Type safety**: Leverage TypeScript. Define clear types for your state and actions.
- **Testing**:
  - Store logic (actions, selectors) can often be tested independently of UI components.
  - For components using stores, mock the stores or provide initial states suitable for your test cases.
- **Naming conventions**: Use clear and consistent names for your stores and state properties (e.g., `userStore`, `profileSettingsStore`).

## Troubleshoot common issues

Here are some common issues and how to resolve them:

| Problem                                       | Possible Cause                                                     | Solution                                                                                                                                                            |
| :-------------------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component not re-rendering after state change | Store not updated via `$set()` or updater from `$use()`.           | Ensure all state modifications use the store's update mechanisms.                                                                                                   |
|                                               | Selector in `$use(selector, deps)` has incorrect dependencies.     | Verify the `deps` array for selectors in `$use()`.                                                                                                                  |
|                                               | Using `$get()` in render path instead of `$use()`.                 | Use `$use()` to subscribe React components to store changes. `$get()` does not subscribe.                                                                           |
|                                               | Selector captures external variables instead of store state.       | Ensure selectors depend only on the store state parameter, not external variables. Use store-level selectors for cross-store dependencies.                          |
| Derived state not updating reactively         | Using `useMemo` with incomplete dependencies.                      | Include all store data in `useMemo` dependencies, or better yet, use `$use()` with a selector that depends on store state.                                          |
|                                               | External variables captured in selector closure.                   | Rewrite selectors to depend on store state: `store.$use(state => state.items.filter(item => item.ownedBy === state.selectedUserId))`.                               |
| Array elements treated as stores              | Attempting to call store methods on array elements.                | Array elements are plain data. Use `arrayStore.$get()[index].property` instead of `arrayStore[index].property.$get()`.                                              |
| State not persisting                          | Persistence adapter misconfigured (e.g., wrong key).               | Double-check adapter configuration (`key`, `stringify`, `parse`).                                                                                                   |
|                                               | Data not serializable (e.g., functions, Symbols).                  | Ensure state is serializable or provide custom `stringify`/`parse` functions.                                                                                       |
|                                               | Browser storage limits exceeded.                                   | Be mindful of storage limits (especially for cookies and localStorage).                                                                                             |
| Type errors with store                        | Initial state type mismatch with usage.                            | Ensure the type of `initialState` matches how you intend to use the store.                                                                                          |
|                                               | Incorrect type in `$set()` or action payload.                      | Verify types for updates and action arguments.                                                                                                                      |
| Asynchronous data not appearing in store      | Accessing store before Promise in `createStore(promise)` resolves. | `await createStore(promise)` or use `$act()`/`$use()` which will update when the promise resolves.                                                                  |
|                                               | Promise rejected.                                                  | Add error handling for the promise passed to `createStore` or for the async operation that provides data for `$set()`.                                              |
| `oldState` is `undefined` in `$act`           | This is expected on the initial immediate call of the subscriber.  | The first time a subscriber is called (if `immediate` is true or default), `oldState` will be `undefined` as there's no "previous" state for that subscription yet. |
| Circular references causing issues            | While supported, complex interactions might still be tricky.       | Ensure `normalizeObject` is used if input objects are not plain data. Simplify state structure if possible.                                                         |
| Actions not updating state correctly          | Using `this` context instead of store variable.                    | In action functions, use the store variable (e.g., `myStore.property.$set(value)`) instead of `this.property.$set(value)`.                                          |
| Functions/symbols missing after normalization | `normalizeObject()` strips functions and symbol keys.              | This is expected behavior. Functions and symbol keys are filtered out. Handle them separately if needed.                                                            |

## Contribute to the project

Contributions are welcome! We appreciate your help in making `@ibnlanre/portal` better.
You can contribute by:

- Reporting bugs or issues.
- Suggesting new features or enhancements.
- Submitting pull requests with code changes or documentation improvements.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines on how to contribute, including coding standards, testing requirements, and the pull request process.

## Get help and support

If you need help using `@ibnlanre/portal`, the best place to start is the documentation provided in this README and the [API Reference](https://ibnlanre.github.io/portal/). If you have specific questions or need assistance with implementation, you can also check the examples provided in the repository or ask for help in the community. If you encounter issues or have questions:

1.  **Check existing issues**: Look through the [GitHub Issues](https://github.com/ibnlanre/portal/issues) to see if your question has already been addressed.
2.  **Open a new issue**: If you can't find a solution, open a new issue on GitHub. Provide as much detail as possible, including:
    - Version of `@ibnlanre/portal`.
    - Steps to reproduce the issue.
    - Relevant code snippets.
    - Error messages, if any.
3.  **Discussions**: Check the [GitHub Discussions tab](https://github.com/ibnlanre/portal/discussions) (if enabled for the repository) for community help, questions, and to share ideas.

## License

This project is licensed under the [BSD-3-Clause License](LICENSE).
Copyright (c) 2025, ibnlanre.
