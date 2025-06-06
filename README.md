# @ibnlanre/portal

A [TypeScript][typescript] state management library for [React][react] applications.

## Table of Contents

- [Installation](#installation)
  - [Using Package Managers](#using-package-managers)
    - [`npm`](#npm)
    - [`pnpm`](#pnpm)
    - [`yarn`](#yarn)
  - [Using a CDN](#using-a-cdn)
    - [`skypack`](#skypack)
    - [`unpkg`](#unpkg)
    - [`jsDelivr`](#jsdelivr)
- [Usage](#usage)
  - [Managing State](#managing-state)
  - [Accessing State with `$get`](#accessing-state-with-get)
  - [Updating State with `$set`](#updating-state-with-set)
  - [Subscribing to State Changes with `$act`](#subscribing-to-state-changes-with-act)
    - [Unsubscribing from State Changes](#unsubscribing-from-state-changes)
    - [Preventing Immediate Callback Execution](#preventing-immediate-callback-execution)
  - [Nested Stores](#nested-stores)
    - [Breaking Off Stores](#breaking-off-stores)
    - [Updating Nested Stores](#updating-nested-stores)
  - [Accessing Nested Stores with `$key`](#accessing-nested-stores-with-key)
  - [Actions](#actions)
    - [Reducer Pattern](#reducer-pattern)
    - [Internal Actions](#internal-actions)
  - [Asynchronous State](#asynchronous-state)
  - [React Integration](#react-integration)
    - [Basic Usage](#basic-usage)
    - [Modifying State with a Selector](#modifying-state-with-a-selector)
    - [Using Dependencies with the `$use` Hook](#using-dependencies-with-the-use-hook)
    - [Partial State Updates](#partial-state-updates)
    - [Advanced Usage Patterns](#advanced-usage-patterns)
- [Persistence](#persistence)
  - [Web Storage Adapter](#web-storage-adapter)
    - [Local Storage Adapter](#local-storage-adapter)
    - [Session Storage Adapter](#session-storage-adapter)
  - [Browser Storage Adapter](#browser-storage-adapter)
  - [Cookie Storage Adapter](#cookie-storage-adapter)
    - [Signed Cookies](#signed-cookies)
    - [Updating Cookie Options](#updating-cookie-options)
- [Cookie Storage](#cookie-storage)
  - [Motivation](#motivation)
  - [Utility Functions](#utility-functions)
    - [sign(value: string, secret: string): string](#signvalue-string-secret-string-string)
    - [unsign(signedValue: string, secret: string): string](#unsignsignedvalue-string-secret-string-string)
    - [getItem(key: string): string](#getitemkey-string-string)
    - [setItem(key: string, value: string): void](#setitemkey-string-value-string-void)
    - [removeItem(key: string): void](#removeitemkey-string-void)
    - [clear(): void](#clear-void)
    - [createKey(options: Object): string](#createkeyoptions-object-string)
    - [key(index: number): string](#keyindex-number-string)
    - [length: number](#length-number)
- [Contributions](#contributions)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use either a [CDN][cdn], or a [package manager][package-manager]. Run the following command within your project directory. The library is written in [TypeScript][typescript] and ships with its own type definitions, so you don't need to install any type definitions.

### Using Package Managers

If you are working on a project that uses a [package manager][package-manager], you can copy one of the following commands to install `@ibnlanre/portal` using your preferred [package manager][package-manager], whether it's [npm][npm], [pnpm][pnpm], or [yarn][yarn].

#### `npm`

```bash
npm i @ibnlanre/portal
```

#### `pnpm`

```bash
pnpm add @ibnlanre/portal
```

#### `yarn`

```bash
yarn add @ibnlanre/portal
```

### Using a CDN

If you are working on a project that uses markup languages like [HTML][html] or [XML][xml], you can copy one of the following script tags to install `@ibnlanre/portal` using your preferred [CDN][cdn]:

#### `skypack`

```html
<script type="module">
  import { createStore } from "https://cdn.skypack.dev/@ibnlanre/portal";
</script>
```

#### `unpkg`

```html
<script src="https://unpkg.com/@ibnlanre/portal"></script>
```

#### `jsDelivr`

```html
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
```

## Usage

`@ibnlanre/portal` simplifies state management with its intuitive and developer-friendly [API][api]. Built with scalability and flexibility in mind, it integrates seamlessly with [React][react] applications while remaining lightweight and easy to use. Managing application state should not be a complex task, and `@ibnlanre/portal` is designed to make the process effortless, even in existing codebases.

### State Management Methods

`@ibnlanre/portal` provides a consistent API across both primitive and composite stores. Each store comes with a set of core methods for state management:

#### The $get Method

Retrieves the current state or computes a derived value using an optional selector function:

```typescript
const store = createStore({
  count: 0,
  user: { name: "John" },
});

// Basic state retrieval
store.$get(); // { count: 0, user: { name: "John" } }
store.count.$get(); // 0
store.user.name.$get(); // "John"

// Using selectors
store.count.$get((count) => count + 5); // 5
store.user.name.$get((name) => name.toUpperCase()); // "JOHN"
```

#### The $set Method

Updates state using direct values or update functions:

```typescript
// Direct value updates
store.count.$set(5);
store.user.$set({ name: "Jane" });

// Functional updates using previous state
store.count.$set((prev) => prev + 1);
store.user.name.$set((name) => name.toUpperCase());

// Partial state updates (merging)
store.$set({ count: 10 });
store.$set((prev) => ({ count: prev.count + 1 }));
```

#### The $act Method

Subscribes to state changes with optional immediate notification:

```typescript
// Subscribe to root state changes
const unsubscribe = store.$act((state) => {
  console.log("State changed:", state);
}, true); // true for immediate notification

// Subscribe to specific value changes
store.count.$act((count) => {
  console.log("Count changed:", count);
});

// Unsubscribe when needed
unsubscribe();
```

- `$act`: Subscribe to state changes to react to updates.
- `$key`: Access deeply nested stores using a dot-separated string.

### Store Types

`@ibnlanre/portal` provides two types of stores:

1. **Primitive Store**: For managing primitive values (strings, numbers, booleans, etc.)
2. **Composite Store**: For managing objects and nested state structures

The `createStore` function automatically determines which type of store to create based on your initial state:

```typescript
// Creates a primitive store
const numberStore = createStore(42);
const stringStore = createStore("hello");

// Creates a composite store
const objectStore = createStore({
  count: 0,
  user: {
    name: "John",
    preferences: { theme: "light" },
  },
});
```

#### Store Methods

Both primitive and composite stores provide the following core methods:

- `$get`: Retrieve the current state or a derived value using a selector
- `$set`: Update the state with a new value or using an update function
- `$act`: Subscribe to state changes with optional immediate notification
- `$use`: React hook for integrating state with components

Composite stores additionally provide:

- `$key`: Access nested state using dot notation paths

Example usage:

```typescript
// With a primitive store
const counter = createStore(0);
counter.$get(); // 0
counter.$set(5); // directly set value
counter.$set((prev) => prev + 1); // update using function

// With a composite store
const settings = createStore({
  theme: "light",
  notifications: true,
  user: { name: "John" },
});

settings.$get(); // gets full state object
settings.theme.$get(); // "light"
settings.$key("user.name").$get(); // "John"

// Subscribe to changes
settings.$act((state) => console.log(state));
settings.theme.$act((theme) => console.log(theme));

// Use in React components
function ThemeDisplay() {
  const [theme, setTheme] = settings.theme.$use();
  return <div>{theme}</div>;
}
```

#### Custom Store Handles

You can customize which methods are available on a store by passing an array of handles as the second argument to `createStore`:

```typescript
// Only include $get and $set methods
const readWriteStore = createStore("value", ["$get", "$set"]);

// Create a read-only store
const readOnlyStore = createStore({ data: "test" }, ["$get", "$act"]);
```

This allows you to create stores with restricted capabilities based on your needs.

### Accessing State with $get

The `$get` [method][method] provides a straightforward way to access the current state synchronously. It’s ideal when you need to read the state without setting up a subscription.

```typescript
const value = store.$get();
console.log(value); // "initial value"
```

You can also pass a [callback function][callback] to $get to modify the state before accessing it. The [callback][callback] receives the current state and returns the modified value. This lets you work with a transformed state without altering the actual store.

```typescript
const modifiedValue = store.$get((value) => `${value} modified`);
console.log(modifiedValue); // "initial value modified"
```

### Updating State with `$set`

The `$set` [method][method] updates the state with a new value. Simply pass the desired value to this method, and it immediately replaces the current state.

```typescript
store.$set("new value");
const newValue = store.$get(); // "new value"
```

Alternatively, `$set` can accept a [callback function][callback] that takes the previous state as an argument and returns the updated state. This approach is useful for making updates that depend on the previous state.

```typescript
store.$set((prev) => `${prev} updated`);
const updatedValue = store.$get(); // "new value updated"
```

#### Partial State Updates

The `$set` method also supports partial state updates when the state is an object. You can pass an object containing the properties to update, and `$set` will merge the new properties with the existing state.

```typescript
const store = createStore({ name: "John", age: 30 });

store.$set({ age: 31 });
const updatedState = store.$get(); // { name: "John", age: 31 }
```

### Subscribing to State Changes with `$act`

In addition to accessing and updating state, `@ibnlanre/portal` provides the `$act` [method][method] to subscribe to state changes. This allows you to react to updates and perform [side effects][side-effects] when the state changes.

```typescript
store.$act((value) => console.log(value));
```

#### Unsubscribing from State Changes

The `$act` [method][method] returns an `unsubscribe` function that can be called to stop listening for updates. This is particularly useful when a component unmounts or when you no longer need the subscription.

```typescript
const unsubscribe = store.$act((value) => {
  console.log(value);
});

// Stop listening to state changes
unsubscribe();
```

#### Preventing Immediate Callback Execution

By default, the `$act` [callback][callback] is invoked immediately after subscribing. To disable this behavior, pass `false` as the second argument. This ensures the callback is only executed when the state changes.

```typescript
store.$act((value) => {
  console.log(value);
}, false);
```

### Nested State Management

`@ibnlanre/portal` excels at managing deeply nested state through its composite store capabilities. When you create a store with an object, each nested property becomes its own store instance, providing seamless access to state management methods at every level.

```typescript
const store = createStore({
  location: {
    unit: "Apt 1",
    address: {
      street: "123 Main St",
      city: "Springfield",
    },
  },
});

// Access nested state directly
const city = store.location.address.city.$get();
console.log(city); // "Springfield"

// Use selectors for derived values
store.location.address.street.$get((street) => street.toUpperCase());
// "123 MAIN ST"

// Access nested state using $key
store.$key("location.address.city").$get(); // "Springfield"
store.location.$key("address.city").$get(); // "Springfield"
```

#### Independent Nested Store Operations

Every node in the state tree is a fully functional store that can be used independently. You can extract any part of the nested structure and work with it as a separate store, while maintaining the connection to the root state.

```typescript
// Extract nested stores
const { address } = store.location;
const { street } = address;

// Each level maintains full store functionality
address.street.$get(); // "123 Main St"
address.city.$set("New City");

// Update state through any reference
street.$set("456 Elm St");
street.$set((prev) => `${prev} Apt 2`);

// Subscribers work at any level
address.$act((state) => {
  console.log(state); // { street: "456 Elm St Apt 2", city: "New City" }
});
street.$act((value) => {
  console.log(value); // "456 Elm St Apt 2"
});
```

#### State Updates and Immutability

`@ibnlanre/portal` handles state updates immutably, allowing you to work with state at any level while maintaining consistency throughout the state tree. You can:

- Update individual values
- Merge partial state
- Update multiple nested values
- Use update functions for computed changes

```typescript
// Update complete state
store.$set({
  location: {
    unit: "Unit 2B",
    address: {
      street: "789 Oak Rd",
      city: "New City",
    },
  },
});

// Merge partial state
store.$set({ location: { unit: "Unit 3C" } });

// Update nested values directly
store.location.unit.$set("Unit 4D");
store.location.address.$set({
  street: "321 Pine St",
  city: "Another City",
});

// Use update functions
store.location.address.street.$set((street) => street.toUpperCase());
```

The state is updated immutably at all levels, ensuring that:

1. Original state is preserved
2. All subscribers receive appropriate updates
3. React components re-render efficiently

### Accessing Nested Stores with `$key`

To conveniently access deeply nested stores, you can use the `$key` method with a dot-separated string. This method leverages [TypeScript][typescript]'s IntelliSense for path suggestions, providing an overview of the available nested stores. This makes managing complex state structures more intuitive and efficient.

```typescript
const street = store.$key("location.address.street");
street.$get(); // 456 Elm St
```

The `$key` method returns a reference to the nested store, which means you can access and update the nested state directly. It can be used at any level of the hierarchy, allowing you to work with deeply nested stores without the need for manual traversal.

```typescript
store.$key("location.address.street").$set("789 Oak St");

const { street } = store.location.$key("address");
street.$get(); // 789 Oak St
```

### Actions

`@ibnlanre/portal` allows you to store plain functions alongside primitives and objects. When the initial state is an object, functions within it are not converted into nested stores but remain callable as [methods][method]. This approach simplifies managing complex state transitions, [co-locates][colocation] logic with state, and reduces [boilerplate][boilerplate] in larger applications.

```typescript
const count = createStore({
  value: 0,
  increase(amount: number = 1) {
    count.value.$set((prev) => prev + amount);
  },
  decrease(amount: number = 1) {
    count.value.$set((prev) => prev - amount);
  },
  reset() {
    count.value.$set(0);
  },
});

count.increase(5);
count.reset();
```

#### Reducer Pattern

One thing to note is that you have full control over how the function is defined, named, and structured, including its interaction with the store, the format of its arguments and whether it is nested. This flexibility allows you to implement a [reducer][reducer] pattern that aligns with your judgment and preferences.

```typescript
type CountControlAction = {
  type: "increase" | "decrease" | "reset";
  amount?: number;
};

const count = createStore({
  value: 0,
  dispatch({ type, amount = 1 }: CountControlAction) {
    switch (type) {
      case "increase":
        count.value.$set((prev) => prev + amount);
        break;
      case "decrease":
        count.value.$set((prev) => prev - amount);
        break;
      case "reset":
        count.value.$set(0);
        break;
    }
  },
});

count.dispatch({ type: "increase", amount: 5 });
count.dispatch({ type: "reset" });
```

#### Internal Actions

In scenarios, where you do not want the actions to be exposed as [methods][method] through the store, you can create regular functions that interacts with the store. These functions can then be called directly or used as a callback in other functions.

```typescript
export const count = createStore({
  value: 0,
});

function increase(amount: number = 1) {
  count.value.$set((prev) => prev + amount);
}

function decrease(amount: number = 1) {
  count.value.$set((prev) => prev - amount);
}

function reset() {
  count.value.$set(0);
}

externalService.on("connect", increase);
externalService.on("disconnect", decrease);
externalService.on("error", reset);
```

### Asynchronous State

The `createStore` function also supports [asynchronous][asynchronous] state initialization. You can pass an async function that returns a [Promise][promise] resolving to the initial state. This is particularly useful for scenarios where the initial state needs to be fetched from an external API.

**Note** that the store will remain empty until the [Promise][promise] resolves. Also, if the resolved value is an object, it will be treated as a primitive value, not as a nested store. This is because nested stores are only created during [initialization][initialization] from objects directly passed to the `createStore` function.

Here’s an example:

```typescript
type State = { apartment: string };

async function fetchData(): Promise<State> {
  const response = await fetch("https://api.example.com/data");
  return response.json();
}

// Create a store with an asynchronous initial state
const store = await createStore(fetchData);

const state = store.$get();
console.log(state); // { apartment: "123 Main St" }
```

By combining nested stores and asynchronous initialization, `@ibnlanre/portal` enables you to manage state efficiently in even the most dynamic applications.

### React Integration

`@ibnlanre/portal` offers seamless, first-class support for [React][react] applications. Each store instance provides a `$use` [hook][hook], which works similarly to React’s built-in [useState][use-state] hook. This hook returns a tuple: the **current state value** and a **dispatch function** to update the state.

#### Basic Usage

To use a store in a React component, simply call the `$use` hook on your store:

```jsx
import { store } from "./path-to-your-store";

function Component() {
  const [state, setState] = store.$use();
  return <input value={state} onChange={(e) => setState(e.target.value)} />;
}
```

The `$use` hook automatically subscribes your component to state changes and unsubscribes when the component unmounts. This means your UI will always reflect the latest state, with no manual subscription management required.

#### Modifying State with a Selector

Like `$get` and `$set`, the `$use` hook can accept a selector (callback function) as its first argument. This allows you to transform the state before it’s returned to your component, without mutating the store itself.

```typescript
const [state, setState] = store.$use((value) => `${value} modified`);
```

> **Note:** The selector only affects the value returned to the component, not the store’s internal state. The `setState` function always expects the original state type.

#### Using Dependencies with the `$use` Hook

If your selector depends on external values, you can pass a dependency array as the second argument. This works just like the dependency array in [useEffect][use-effect] or [useMemo][use-memo], ensuring the selector is only recomputed when dependencies change.

```typescript
const [count, setCount] = useState(0);
const [state, setState] = store.$use(
  (value) => `Count: ${count} - ${value}`,
  [count]
);
```

#### Partial State Updates

When your store holds an object, the `setState` function supports partial updates. Pass an object with only the properties you want to update, and the store will merge them with the existing state.

```tsx
const store = createStore({ name: "John", age: 30 });

function Component() {
  const [state, setState] = store.$use();
  const updateAge = () => setState({ age: 31 });

  return (
    <div>
      <p>{state.name}</p>
      <p>{state.age}</p>
      <button onClick={updateAge}>Update Age</button>
    </div>
  );
}
```

#### Advanced Usage Patterns

The `$use` hook is highly flexible and supports a variety of advanced patterns:

1. **Selectors for Derived State**

   Transform state before rendering:

   ```tsx
   function UppercaseName() {
     const [name] = store.user.name.$use((name) => name.toUpperCase());

     return <div>{name}</div>;
   }
   ```

2. **Dependency Arrays for Memoization**

   Control when selectors are recomputed:

   ```tsx
   function FormattedUser({ formatter }) {
     const [user] = store.user.$use((user) => formatter(user), [formatter]);
     return <div>{user}</div>;
   }
   ```

3. **Nested State Access**

   Work with any level of state granularity:

   ```tsx
   function UserPreferences() {
     const [prefs] = store.user.preferences.$use();
     const [theme] = store.user.preferences.theme.$use();

     return (
       <>
         <div>All preferences: {JSON.stringify(prefs)}</div>
         <div>Theme: {theme}</div>
       </>
     );
   }
   ```

4. **Synchronized Updates Across Components**

   All components using the same store (or its nested stores) stay in sync:

   ```tsx
   function UserDashboard() {
     const [user] = store.$use();
     const [name] = store.user.name.$use();
     const [prefs] = store.user.preferences.$use();

     return (
       <>
         <UserInfo user={user} />
         <UserName name={name} />
         <PreferencesPanel prefs={prefs} />
       </>
     );
   }
   ```

5. **Efficient Partial Updates**

   Update nested state efficiently with functional updates:

   ```tsx
   function ThemeToggle() {
     const [, setUser] = store.user.$use();
     const toggleTheme = () => {
       setUser((prev) => ({
         ...prev,
         preferences: {
           ...prev.preferences,
           theme: prev.preferences.theme === "light" ? "dark" : "light",
         },
       }));
     };

     return <button onClick={toggleTheme}>Toggle Theme</button>;
   }
   ```

#### How `$use` Works

- Subscribes to state changes when the component mounts
- Unsubscribes automatically on unmount
- Triggers efficient, targeted re-renders
- Preserves TypeScript type safety for state and updates

## Persistence

`@ibnlanre/portal` provides storage [adapters][adapter] for [local storage][local-storage], [session storage][session-storage], and [cookies][cookies]. These [adapters][adapter] allow you to persist state across sessions and devices. The storage [adapters][adapter] are created using the `createLocalStorageAdapter`, `createSessionStorageAdapter`, and `createCookieStorageAdapter` functions.

Each function takes a key as a parameter and returns two functions: one to get the state and the other to set the state. The `createStore` function can then be used with these storage [adapters][adapter] to create a store that persists state in the [web storage][web-storage].

### Web Storage Adapter

To persist state within the local/session storage of the browser, you can use either the `createLocalStorageAdapter` or `createSessionStorageAdapter` functions respectively. The parameters for these functions are the same. They are as follows:

- `key`: The key used to store the state in the [web storage][web-storage].
- `stringify`: A function to serialize the state to a string. The default is `JSON.stringify`.
- `parse`: A function to deserialize the state from a string. The default is `JSON.parse`.

#### Local Storage Adapter

The only required parameter for the [web storage][web-storage] adapters is the `key`. This is the key used to store the state in the [storage][web-storage], as well as, to retrieve and update the state from the [storage][web-storage]. It's important to **note** that the `key` is unique to each store, and should be unique to prevent conflicts with other stores.

```typescript
import { createLocalStorageAdapter } from "@ibnlanre/portal";

const [getLocalStorageState, setLocalStorageState] = createLocalStorageAdapter({
  key: "storage",
});
```

Through the `stringify` and `parse` functions, you can customize how the state is serialized and deserialized. This is useful when working with non-JSON serializable values or when you want to encrypt the state before storing it in the [web storage][web-storage].

```typescript
import { createStore, createLocalStorageAdapter } from "@ibnlanre/portal";

const [getLocalStorageState, setLocalStorageState] = createLocalStorageAdapter({
  key: "storage",
  stringify: (state) => btoa(JSON.stringify(state)),
  parse: (state) => JSON.parse(atob(state)),
});
```

The benefit of using the storage [adapters][adapter] is that they can be used to automatically load the state from the storage when the store is being created. This allows you to initialize the store with the persisted state.

```typescript
const store = createStore(getLocalStorageState);
```

To persist the state in the [local storage][local-storage], you can subscribe to the store changes and update the storage with the new state. This ensures that the state is always in sync with the [local storage][local-storage].

```typescript
store.$act(setLocalStorageState);
```

#### Session Storage Adapter

The `sessionStorage` adapter works similarly to the `localStorage` adapter. The only difference is that the state is stored in the [session storage][session-storage] instead of the [local storage][local-storage]. This is useful when you want the state to persist only for the duration of the session.

```typescript
import { createStore, createSessionStorageAdapter } from "@ibnlanre/portal";

const [getSessionStorageState, setSessionStorageState] =
  createSessionStorageAdapter({
    key: "storage",
  });

const store = createStore(getSessionStorageState);
store.$act(setSessionStorageState);
```

**Note** that both `getLocalStorageState` and `getSessionStorageState` are functions that can take an optional fallback state as an argument. This allows you to provide a default state when the state is not found in the storage.

```typescript
const store = createStore(() => getLocalStorageState("initial value"));
store.$act(setLocalStorageState);
```

### Browser Storage Adapter

Although the storage [adapters][adapter] provided by the library are a select few, if you need to use a different storage mechanism, such as [IndexedDB][indexed-db] or a [custom API][storage], you can create your own [browser storage][browser-storage] adapter. The [browser storage][browser-storage] adapter only requires a **key**, and functions to **get** the item, **set** the item, and **remove** the item from the storage. Other options like `stringify` and `parse` are optional.

```typescript
import { createStore, createBrowserStorageAdapter } from "@ibnlanre/portal";

const storage = new Storage();

const [getStorageState, setStorageState] = createBrowserStorageAdapter({
  key: "storage",
  getItem: (key: string) => storage.getItem(key),
  setItem: (key: string, value: string) => storage.setItem(key, value),
  removeItem: (key: string) => storage.removeItem(key),
});
```

### Cookie Storage Adapter

The last of the storage [adapters][adapter] provided by the library is the `cookie storage` adapter. It is created using the `createCookieStorageAdapter` function, which takes a key and an optional configuration object with cookie options. These options are similar to those provided by the `document.cookie` API.

```typescript
import { createCookieStorageAdapter } from "@ibnlanre/portal";

const [getCookieStorageState, setCookieStorageState] =
  createCookieStorageAdapter({
    key: "storage",
    domain: "example.com",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
```

#### Signed Cookies

To enhance security, you can provide a `secret` parameter to [sign][signing] the cookie value. This adds an extra layer of protection, ensuring the cookie value has not been tampered with. To use the `secret` value, set `signed` to `true`.

**Note** that an error will be thrown if `signed` is set to `true` and the `secret` is not provided. To prevent this, ensure that the `secret` is provided or set `signed` to `false` to disable [signing][signing].

```typescript
import { createCookieStorageAdapter } from "@ibnlanre/portal";

const secret = process.env.COOKIE_SECRET_KEY;

if (!secret) {
  throw new Error("Cookie secret key is required");
}

const [getCookieStorageState, setCookieStorageState] =
  createCookieStorageAdapter({
    key: "storage",
    sameSite: "Strict",
    signed: !!secret,
    secret,
  });
```

#### Updating Cookie Options

One key difference between the `createCookieStorageAdapter` function and the other storage adapter functions is that its `setCookieStorageState` function takes an additional parameter: the `cookie options`. This allows you to update the initial cookie options when setting the cookie value. This is useful when you want to update the `max-age` or `expires` options of the cookie.

```typescript
const store = createStore(getCookieStorageState);

store.$act((value) => {
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  setCookieStorageState(value, {
    secure: true,
    partitioned: false,
    httpOnly: true,
    expires,
  });
});
```

## Cookie Storage

One key module provided by the library is the `cookieStorage` module. This module provides a set of functions to manage [cookies][cookies] in a [web application][web-application]. Just like [localStorage][local-storage] and [sessionStorage][session-storage], [cookies][cookies] are a way to store data in the [browser][web-browser].

### Motivation

[Cookies][cookies] are useful for storing small amounts of data that need to be sent with each request to the server. However, most modern [web browsers][web-browser] do not have a means to manage [cookies][cookies], and this is where the `cookieStorage` module comes in. Accessing the `cookieStorage` module is similar to accessing the other modules provided by the library.

```typescript
import { cookieStorage } from "@ibnlanre/portal";
```

### Utility Functions

All functions in the `cookieStorage` module are static and do not require an [instance][instance] of the module to be created. This is because the module is a utility module that provides a set of functions to manage [cookies][cookies]. The following are the functions provided by the `cookieStorage` module:

- **sign(value: string, secret: string): string**

  - Signs a cookie value using a secret key.
  - Parameters:
    - `value`: The cookie value to be signed.
    - `secret`: The secret key used to sign the cookie.
  - Returns: The signed cookie value.
  - Example:
    ```typescript
    const signedValue = cookieStorage.sign("value", "secret");
    ```

- **unsign(signedValue: string, secret: string): string**

  - Unsigns a signed cookie value using a secret key.
  - Parameters:
    - `signedValue`: The signed cookie value to be unsigned.
    - `secret`: The secret key used to unsign the cookie.
  - Returns: The original cookie value.
  - Example:
    ```typescript
    const originalValue = cookieStorage.unsign(signedValue, "secret");
    ```

- **getItem(key: string): string**

  - Retrieves the value of a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to retrieve.
  - Returns: The value of the cookie.
  - Example:
    ```typescript
    const value = cookieStorage.getItem("key");
    ```

- **setItem(key: string, value: string): void**

  - Sets the value of a cookie.
  - Parameters:
    - `key`: The key of the cookie to set.
    - `value`: The value to set for the cookie.
  - Example:
    ```typescript
    cookieStorage.setItem("key", "value");
    ```

- **removeItem(key: string): void**

  - Removes a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to remove.
  - Example:
    ```typescript
    cookieStorage.removeItem("key");
    ```

- **clear(): void**

  - Clears all cookies.
  - Example:
    ```typescript
    cookieStorage.clear();
    ```

- **createKey(options: Object): string**

  - Creates a cookie key based on the provided options.
  - Parameters:
    - `options.cookieFragmentDescription`: The description of the cookie fragment.
    - `options.cookiePrefix`: The prefix to use for the cookie key. Default is `"__"`.
    - `options.cookieFragmentSizes`: The sizes of the cookie fragments. Default is `[]`.
    - `options.cookieScope`: The scope of the cookie. Default is `"host"`.
    - `options.cookieScopeCase`: The case of the cookie scope. Default is `"title"`.
    - `options.cookieService`: The service to use for the cookie. Default is `""`.
    - `options.cookieScopeServiceConnector`: The connector to use for the cookie scope and service. Default is `"-"`.
    - `options.cookieScopeFragmentConnector`: The connector to use for the cookie scope and fragment. Default is `"_"`.
    - `options.cookieFragmentsConnector`: The connector to use for the cookie fragments. Default is `""`.
    - `options.cookieSuffix`: The suffix to use for the cookie key. Default is `""`.
  - Returns: The generated cookie key.
  - Example:
    ```typescript
    const key = cookieStorage.createKey({
      cookieFragmentDescription: "Authentication Token",
      cookiePrefix: "__",
      cookieFragmentSizes: [2, 3],
      cookieScopeCase: "title",
      cookieScope: "host",
    });
    ```

- **key(index: number): string**

  - Retrieves the key of a cookie by its index.
  - Parameters:
    - `index`: The index of the cookie to retrieve the key for.
  - Returns: The key of the cookie.

  ```typescript
  const key = cookieStorage.key(0);
  ```

- **length: number**

  - Retrieves the number of cookies stored.
  - Returns: The number of cookies.

  ```typescript
  const length = cookieStorage.length;
  ```

## Contributions

All contributions are welcome and appreciated. You can reach me on [Twitter](https://twitter.com/ibnlanre) or [GitHub](https://github.com/ibnlanre) to discuss ideas, report issues, or contribute code. If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/ibnlanre/portal/issues).

If you want to contribute code, please fork the repository, make your changes, and submit a pull request. Make sure to follow the [contribution guidelines](CONTRIBUTING.md) and include tests for any new features or bug fixes.

Your contributions help make `@ibnlanre/portal` a better state management library for everyone. Whether it's fixing bugs, improving documentation, or adding new features, your efforts are greatly appreciated. Thank you! 💚

## License

This library is [licensed][licensed] under the [BSD-3-Clause][bsd-3-clause]. See the [LICENSE](LICENSE) file for more information.

[adapter]: https://blog.stackademic.com/mastering-the-adapter-design-pattern-c118e90f696b
[api]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction
[asynchronous]: https://www.pluralsight.com/resources/blog/guides/introduction-to-asynchronous-javascript
[boilerplate]: https://medium.com/theymakedesign/what-is-boilerplate-in-web-code-6062abace58e
[browser-storage]: https://javascript-conference.com/blog/web-browser-storage/
[bsd-3-clause]: https://opensource.org/licenses/BSD-3-Clause
[callback]: https://builtin.com/software-engineering-perspectives/callback-function
[cdn]: https://www.cloudflare.com/en-gb/learning/cdn/what-is-a-cdn/
[colocation]: https://kentcdodds.com/blog/colocation
[cookies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
[hook]: https://react.dev/reference/react/hooks
[html]: https://developer.mozilla.org/en-US/docs/Web/HTML
[indexed-db]: https://web.dev/articles/indexeddb/
[initialization]: https://web.dev/learn/javascript/data-types/variable
[instance]: https://www.altcademy.com/blog/what-is-an-instance-in-javascript/
[licensed]: https://choosealicense.com/licenses/bsd-3-clause/
[local-storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[method]: https://www.altcademy.com/blog/what-are-methods-in-javascript/
[npm]: https://www.npmjs.com/
[package-manager]: https://www.cookielab.io/blog/package-managers-comparison-yarn-npm-pnpm
[pnpm]: https://pnpm.io/
[promise]: https://www.joshwcomeau.com/javascript/promises/
[react]: https://react.dev/
[reducer]: https://www.mitchellhanberg.com/post/2018/10/24/reducers-exploring-state-management-in-react/
[session-storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[side-effects]: https://monsterlessons-academy.com/posts/what-are-side-effects-in-javascript-what-are-pure-functions
[signing]: https://bloggle.coggle.it/post/190706036692/what-weve-learned-from-moving-to-signed-cookies
[storage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage
[typeScript]: https://www.typescriptlang.org
[use-effect]: https://react.dev/reference/react/useEffect
[use-memo]: https://react.dev/reference/react/useMemo
[use-state]: https://react.dev/reference/react/useState
[web-application]: https://aws.amazon.com/what-is/web-application/
[web-browser]: https://www.ramotion.com/blog/what-is-web-browser/
[web-storage]: https://www.ramotion.com/blog/what-is-web-storage/
[xml]: https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction
[yarn]: https://yarnpkg.com/
