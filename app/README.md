# @ibnlanre/portal

A TypeScript state management library for React applications.

## Table of Contents

- [Installation](#installation)
  - [Using package managers](#using-package-managers)
    - [`yarn`](#yarn)
    - [`npm`](#npm)
    - [`pnpm`](#pnpm)
- [Core Features](#core-features)
  - [Create Store](#create-store)
  - [Accessing State](#accessing-state)
  - [Updating State](#updating-state)
  - [React Integration](#react-integration)
- [Storage Integration](#storage-integration)
  - [Local Storage Adapter](#local-storage-adapter)
  - [Session Storage Adapter](#session-storage-adapter)
  - [Cookie Storage Adapter](#cookie-storage-adapter)
  - [Custom Storage Adapter](#custom-storage-adapter)
- [Cookie Storage](#cookie-storage)
  - [Functions](#functions)
  - [Usage](#usage)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use either a CDN, or a package manager. Run the following command within your project directory. The library is written in TypeScript and ships with its own type definitions, so you don't need to install any type definitions.

### Using package managers

If you are working on a project that uses a package manager, you can copy one of the following commands to install `@ibnlanre/portal` using your preferred package manager:

#### `npm`

```shell
npm i @ibnlanre/portal
```

<details>
  <summary>
    <code>pnpm</code>
  </summary>
  <br/>

```bash
pnpm i @ibnlanre/portal
```

</details>

<details>
  <summary>
    <code>yarn</code>
  </summary>
  <br/>

```shell
yarn add @ibnlanre/portal
```

</details>

### Using a CDN

If you are working on a project that uses markup languages like HTML, you can copy one of the following script tags to install `@ibnlanre/portal` using your preferred CDN:

#### `unpkg`

```html
<script src="https://unpkg.com/@ibnlanre/portal"></script>
```

#### `jsDelivr`

```html
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
```

## Usage

`@ibnlanre/portal` helps you manage state using a simple and intuitive API. Its aim is to provide a flexible and scalable solution for managing state in your React applications. The library is designed to be easy to use and integrate with existing codebases. Managing application state should not be a complex task, and `@ibnlanre/portal` aims to simplify the process.

### Managing State

Creating a store is as simple as calling the `createStore` function with an initial value. The function returns an object with methods to access and update the state. These methods are `$get`, `$set`, and `$use`. The `$get` method returns the current state, the `$set` method updates the state, and the `$use` method is a `React` hook that allows you to manage the state within functional components.

```typescript
import { createStore } from "@ibnlanre/portal";

const store = createStore("initial value");

const value = store.$get();
console.log(value); // "initial value"
```

Asides the aforementioned methods, the store object also has a `$sub` method to subscribe to state changes. This method takes a callback function that is called whenever the state changes. This allows you to react to state changes and perform side effects based on the new state.

```typescript
store.$sub((value) => console.log(value));
store.$set("new value");

const newValue = store.$get(); // "new value"
```

The return value of the `$sub` method is a function that can be called to unsubscribe from the store. This is useful when you want to stop listening to state changes, such as when a component is unmounted. **Note** that the callback function is called immediately after subscribing to the store. To opt out of this behavior, you can pass `false` as the second argument to the `$sub` method. This prevents the callback function from being called immediately.

```typescript
const unsubscribe = store.$sub((value) => {
  console.log(value);
}, false);

unsubscribe();
```

#### Chained Store

Asides regular stores, you can also create chained stores by passing an object to the `createStore` function. The object can contain nested objects, arrays, and primitive values. Each store in the chain has access to its own value, with methods to update and manage that value. This allows you to work with state at any level of the object hierarchy, with minimal effort. This approach also aligns well with the `Flux` architecture, where having a single source of truth can improve the modularity of your application.

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

const street = store.location.address.street.$get();
console.log(street); // "123 Main St"
```

Remember that each point in an object chain is a store, and can be broken off into its own store at any point in the chain. This is useful when you want to work with a nested state independently of the parent store. For example, you can break off the `address` store from the `location` store and work with it independently. **Note**

```typescript
const { address } = store.location;

const street = address.street.$get();
console.log(street); // "123 Main St"
```

Updating a nested store is similar to updating a regular store. You can use the `$set` method to update the value of a nested store. You can also pass a callback function to the `$set` method to update the value based on the previous value. **Note** that the `$set` method updates the value of the store immediately.

```typescript
const setStreet = store.location.address.street.$set();

setStreet("456 Elm St");
setStreet((prev) => `${prev} Apt 2`);
```

#### Asynchronous State

The `createStore` function can also accept an asynchronous function that returns a promise. This is useful for fetching data asynchronously. The function must return a promise that resolves to the initial state. **Note** that the store will be empty until the promise resolves. Additionally, even if the promise returns an object, it would be treated as a primitive value. This is because chained stores are created from objects passed to the `createStore` function, during initialization.

```typescript
type State = { apartment: string };

async function fetchData(): Promise<State> {
  const response = await fetch("https://api.example.com/data");
  return response.json();
}

const store = await createStore(fetchData);
const state = store.$get(); // { apartment: "123 Main St" }
```

## React Integration

`@ibnlanre/portal` has first-class support for React applications. When a store is created, it creates a React hook, `$use`, that allows you to manage the store's state within functional components. Just like the `useState` hook in React, the `$use` hook returns an array with two elements: the state value and a dispatch function to update the state. The benefit of using the `$use` hook over `$get` and `$set` is that it automatically subscribes to state changes and updates the component when the state changes.

```typescript
import type { ChangeEvent } from "react";
import { store } from "./path-to-your-store";

function Component() {
  const [state, setState] = store.$use();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    return setState(event.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}

export default Component;
```

## Persistence

`@ibnlanre/portal` provides storage adapters for local storage, session storage, and cookies. These adapters allow you to persist state across sessions and devices. The storage adapters are created using the `createLocalStorageAdapter`, `createSessionStorageAdapter`, and `createCookieStorageAdapter` functions. Each function takes a key as a parameter and returns two functions: one to get the state and the other to set the state. The `createStore` function can then be used with these storage adapters to create a store that persists state in the browser's storage.

### Local/Session Storage Adapter

To persist state within the local/session storage of the browser, you can use either the `createLocalStorageAdapter` or `createSessionStorageAdapter` functions respectively. The parameters for these functions are the same. The following are the parameters for the storage adapter functions:

- `key`: The key used to store the state in the browser's storage.
- `stringify`: A function to serialize the state to a string. The default is `JSON.stringify`.
- `parse`: A function to deserialize the state from a string. The default is `JSON.parse`.

```typescript
import { createLocalStorageAdapter } from "@ibnlanre/portal";

const [getLocalStorageState, setLocalStorageState] = createLocalStorageAdapter({
  key: "storage",
});
```

Through `stringify` and `parse` functions, you can customize how the state is serialized and deserialized. This is useful when working with non-JSON serializable values or when you want to encrypt the state before storing it in the browser's storage.

```typescript
import { createSessionStorageAdapter } from "@ibnlanre/portal";

const [getSessionStorageState, setSessionStorageState] =
  createSessionStorageAdapter({
    key: "storage",
    stringify: (state) => btoa(state),
    parse: (state) => atob(state),
  });
```

The benefit of using the storage adapters is that they automatically load the state from the storage when the store is created. This allows you to initialize the store with the persisted state. Additionally, the storage adapters provide a way to update the storage when the store changes. This is done by subscribing to the store changes and updating the storage with the new state.

```typescript
import { createStore } from "@ibnlanre/portal";

const store = createStore(getLocalStorageState);
store.$sub(setLocalStorageState);
```

In situations where the store requires an initial value of some sort, you can pass the fallback state to the `getLocalStorageState` or `getSessionStorageState` functions. This allows you to initialize the store with the fallback state if the state is not found in the storage.

```typescript
import { createStore, getSessionStorageState } from "@ibnlanre/portal";

const fallbackState = "initial value";
const store = createStore(() => getSessionStorageState(fallbackState));
```

### Browser Storage Adapter

Although the storage adapters provided by the library are a select few, if you need to use a different storage mechanism, such as IndexedDB or a custom API, you can also create your own custom browser storage adapter. The browser storage adapter only requires a key, and functions to **get** the item, **set** the item, and **remove** the item from the storage. Other options like `stringify` and `parse` are optional.

```typescript
import { createStore, createBrowserStorageAdapter } from "@ibnlanre/portal";

// Create an instance of your custom storage
const storage = new Storage();

// Create custom storage adapter with your storage instance
const [getStorageState, setStorageState] = createBrowserStorageAdapter({
  key: "storage",
  getItem: (key: string) => storage.getItem(key),
  setItem: (key: string, value: string) => storage.setItem(key, value),
  removeItem: (key: string) => storage.removeItem(key),
});
```

### Cookie Storage Adapter

The last of the storage adapters provided by the library is the cookie storage adapter. It is created using the `createCookieStorageAdapter` function, which takes a key and an optional configuration object with cookie options. These options are similar to those provided by the `document.cookie` API.

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

For enhanced security, you can provide a `secret` parameter to sign the cookie value. This adds an extra layer of security to the cookie value, and ensures that the cookie value has not been tampered with. **Note** that you also have to provide the `signed` option to explicitly indicate that the cookie value is signed, or should be signed.

```typescript
import { createCookieStorageAdapter } from "@ibnlanre/portal";

const secret = process.env.COOKIE_SECRET_KEY;

const [getCookieStorageState, setCookieStorageState] =
  createCookieStorageAdapter({
    key: "storage",
    signed: true
    sameSite: "strict",
    secret,
  });
```

One key difference between the `createCookieStorageAdapter` function and the other storage adapter functions is that its `setCookieStorageState` function takes an additional parameter: the cookie options. This allows you to update the initial cookie options when setting the cookie value. This is useful when you want to update the `max-age` or `expires` options of the cookie.

```typescript
const store = createStore(getCookieStorageState);

store.$sub((value) => {
  setCookieStorageState(value, {
    secure: true,
    partitioned: false,
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
  });
});
```

## Cookie Storage

One key module provided by the library is the `cookieStorage` module. This module provides a set of functions to manage cookies in a web application. Just like `localStorage` and `sessionStorage`, cookies are a way to store data in the browser. Cookies are useful for storing small amounts of data that need to be sent with each request to the server. However, most modern web browsers do not have a means to manage cookies, and this is where the `cookieStorage` module comes in. Accessing the `cookieStorage` module is similar to accessing the other modules provided by the library.

```typescript
import { cookieStorage } from "@ibnlanre/portal";
```

### Functions

All functions in the `cookieStorage` module are static and do not require an instance of the module to be created. This is because the module is a utility module that provides a set of functions to manage cookies. The following are the functions provided by the `cookieStorage` module:

- **sign(value: string, secret: string): string**

  - Signs a cookie value using a secret key.
  - Parameters:
    - `value`: The cookie value to be signed.
    - `secret`: The secret key used to sign the cookie.
  - Returns: The signed cookie value.

  ```typescript
  const signedValue = cookieStorage.sign("value", "secret");
  ```

- **unsign(signedValue: string, secret: string): string**

  - Unsigns a signed cookie value using a secret key.
  - Parameters:
    - `signedValue`: The signed cookie value to be unsigned.
    - `secret`: The secret key used to unsign the cookie.
  - Returns: The original cookie value.

  ```typescript
  const originalValue = cookieStorage.unsign(signedValue, "secret");
  ```

- **getItem(key: string): string**

  - Retrieves the value of a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to retrieve.
  - Returns: The value of the cookie.

  ```typescript
  const value = cookieStorage.getItem("key");
  ```

- **setItem(key: string, value: string): void**

  - Sets the value of a cookie.
  - Parameters:
    - `key`: The key of the cookie to set.
    - `value`: The value to set for the cookie.

  ```typescript
  cookieStorage.setItem("key", "value");
  ```

- **removeItem(key: string): void**

  - Removes a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to remove.

  ```typescript
  cookieStorage.removeItem("key");
  ```

- **clear(): void**

  - Clears all cookies.

  ```typescript
  cookieStorage.clear();
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

## License

MIT
