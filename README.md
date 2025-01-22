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
    - [`$get` Method](#get-method)
    - [`$set` Method](#set-method)
    - [`$sub` Method](#sub-method)
  - [Chained Store](#chained-store)
    - [Breaking Off Stores](#breaking-off-stores)
    - [Updating Nested Stores](#updating-nested-stores)
  - [Asynchronous State](#asynchronous-state)
  - [React Integration](#react-integration)
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
    - [key(index: number): string](#keyindex-number-string)
    - [length: number](#length-number)
- [Contributions](#contributions)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use either a [CDN][cdn], or a [package manager][package-manager]. Run the following command within your project directory. The library is written in [TypeScript][typescript] and ships with its own type definitions, so you don't need to install any type definitions.

### Using Package Managers

If you are working on a project that uses a [package manager][package-manager], you can copy one of the following commands to install `@ibnlanre/portal` using your preferred [package manager][package-manager], whether it's [npm][npm], [pnpm][pnpm], or [yarn][yarn].

<details id="npm" open>
  <summary>
    <code>npm</code>
  </summary>
```bash
npm i @ibnlanre/portal
```
</details>

<details id="pnpm">
  <summary>
    <code>pnpm</code>
  </summary>
```bash
pnpm i @ibnlanre/portal
```
</details>

<details id="yarn">
  <summary>
    <code>yarn</code>
  </summary>
```shell
yarn add @ibnlanre/portal
```
</details>

### Using a CDN

If you are working on a project that uses markup languages like [HTML][html] or [XML][xml], you can copy one of the following script tags to install `@ibnlanre/portal` using your preferred [CDN][cdn]:

<details id="skypack" open>
  <summary>
    <code>skypack</code>
  </summary>
```html
<script type="module">
  import { createStore } from "https://cdn.skypack.dev/@ibnlanre/portal";
</script>
```
</details>

<details id="unpkg">
  <summary>
    <code>unpkg</code>
  </summary>
```html
<script src="https://unpkg.com/@ibnlanre/portal"></script>
```
</details>

<details id="jsdelivr">
  <summary>
    <code>jsDelivr</code>
  </summary>
```html
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
```
</details>

## Usage

`@ibnlanre/portal` helps you manage state using a simple and intuitive [API][api]. Its aim is to provide a flexible and scalable solution for managing state in your [React][react] applications. The library is designed to be easy to use and integrate with existing codebases. Managing application state should not be a complex task, and `@ibnlanre/portal` aims to simplify the process.

### Managing State

State management using this library is as simple as calling the `createStore` function with an initial value. The function returns an object with [methods][method] to access and update the state. These [methods][method] are `$get`, `$set`, and `$use`. The `$get` [method][method] returns the current state, the `$set` [method][method] updates the state, and the `$use` [method][method] is a [React hook][react-hook] that allows you to manage the state within functional components.

```typescript
import { createStore } from "@ibnlanre/portal";

const store = createStore("initial value");
```

#### `$get` Method

The `$get` [method][method] is a synchronous operation that returns the current state. It is useful when you want to access the state without subscribing to state changes.

```typescript
const value = store.$get();
console.log(value); // "initial value"
```

#### `$set` Method

The `$set` [method][method] is used to update the state. It takes a new value as an argument and updates the state with that value. It can also take a [callback function][callback] that is called with the previous value. This allows you to update the state based on the previous value. **Note** that the `$set` [method][method] updates the state immediately.

```typescript
store.$set("new value");
const newValue = store.$get(); // "new value"
```

#### `$sub` Method

Asides the aforementioned [methods][method], the store object also has a `$sub` [method][method] to subscribe to state changes. This [method][method] takes a [callback function][callback] that is called whenever the state changes. This allows you to react to state changes and perform [side effects][side-effects] based on the new state.

```typescript
store.$sub((value) => console.log(value));
```

The return value of the `$sub` [method][method] is a function that can be called to unsubscribe from the store. This is useful when you want to stop listening to state changes, such as when a component is unmounted.

**Note** that the [callback function][callback] is called immediately after subscribing to the store. To opt out of this behavior, you can pass `false` as the second argument to the `$sub` method. This prevents the [callback function][callback] from being called immediately.

```typescript
const unsubscribe = store.$sub((value) => {
  console.log(value);
}, false);

unsubscribe();
```

### Chained Store

Asides regular stores, you can also create chained stores by passing an object to the `createStore` function. The object can contain nested objects, arrays, and primitive values. Each store in the chain has access to its own value, with [methods][method] to update and manage that value. This allows you to work with state at any level of the object hierarchy, with minimal effort.

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

#### Breaking Off Stores

Remember that each point in an object chain is a store, and can be broken off into its own store at any point in the chain. This is useful when you want to work with a nested state independently of the parent store. For example, you can break off the `address` store from the `location` store and work with it independently.

```typescript
const { address } = store.location;

const street = address.street.$get();
console.log(street); // "123 Main St"
```

#### Updating Nested Stores

Updating a nested store works similarly to updating a regular store. You can use the `$set` method to change the value of a nested store. Additionally, you can pass a [callback function][callback] to the `$set` method to modify the value based on the previous state. Since a nested store shares the same state across all levels of the object hierarchy, updating a nested store will also update the parent store. This feature is beneficial when you need to manage state at various levels of the object hierarchy.

```typescript
const { street } = store.location.address;

street.$set("456 Elm St");
street.$set((prev) => `${prev} Apt 2`);
```

### Asynchronous State

The `createStore` function can also accept an [asynchronous][asynchronous] function that returns a [promise][promise]. This is useful for fetching data asynchronously. The function must return a [promise][promise] that resolves to the initial state.

**Note** that the store will be empty until the [promise][promise] resolves. Additionally, even if the [promise][promise] returns an object, it would be treated as a primitive value. This is because chained stores are created from objects passed to the `createStore` function, during [initialization][initialization].

```typescript
type State = { apartment: string };

async function fetchData(): Promise<State> {
  const response = await fetch("https://api.example.com/data");
  return response.json();
}

const store = await createStore(fetchData);
const state = store.$get(); // { apartment: "123 Main St" }
```

### React Integration

`@ibnlanre/portal` has first-class support for [React][react] applications. When a store is created, it creates a [React hook][react-hook], `$use`, that allows you to manage the store's state within functional components. Just like the `useState` hook in [React][react], the `$use` hook returns an array with two elements: the state value and a dispatch function to update the state. The benefit of using the `$use` hook over `$get` and `$set` is that it automatically subscribes to state changes and updates the component when the state changes.

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
import { createLocalStorageAdapter } from "@ibnlanre/portal";

const [getLocalStorageState, setLocalStorageState] = createLocalStorageAdapter({
  key: "storage",
  stringify: (state) => btoa(state),
  parse: (state) => atob(state),
});
```

#### Session Storage Adapter

The benefit of using the storage [adapters][adapter] is that they automatically load the state from the storage when the store is created. This allows you to initialize the store with the persisted state. Additionally, the storage [adapters][adapter] provide a way to update the storage when the store changes. This is done by subscribing to the store changes and updating the storage with the new state.

```typescript
import { createStore } from "@ibnlanre/portal";

const store = createStore(getSessionStorageState);
store.$sub(setSessionStorageState);
```

In situations where the store requires an initial value of some sort, you can pass the fallback state to the `getLocalStorageState` or `getSessionStorageState` functions. This allows you to initialize the store with the fallback state if the state is not found in the storage.

```typescript
import { createStore, getSessionStorageState } from "@ibnlanre/portal";

const fallbackState = "initial value";
const store = createStore(() => getSessionStorageState(fallbackState));
```

### Browser Storage Adapter

Although the storage [adapters][adapter] provided by the library are a select few, if you need to use a different storage mechanism, such as IndexedDB or a custom API, you can also create your own custom [browser storage][browser-storage] adapter. The [browser storage][browser-storage] adapter only requires a key, and functions to **get** the item, **set** the item, and **remove** the item from the storage. Other options like `stringify` and `parse` are optional.

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

The last of the storage [adapters][adapter] provided by the library is the cookie storage adapter. It is created using the `createCookieStorageAdapter` function, which takes a key and an optional configuration object with cookie options. These options are similar to those provided by the `document.cookie` API.

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

For enhanced security, you can provide a `secret` parameter to sign the cookie value. This adds an extra layer of security to the cookie value, and ensures that the cookie value has not been tampered with. **Note** that you also have to provide the `signed` option to explicitly indicate that the cookie value is signed, or should be signed.

```typescript
import { createCookieStorageAdapter } from "@ibnlanre/portal";

const secret = process.env.COOKIE_SECRET_KEY;

if (!secret) {
  throw new Error("Cookie secret key is required");
}

const [getCookieStorageState, setCookieStorageState] =
  createCookieStorageAdapter({
    key: "storage",
    sameSite: "strict",
    signed: true,
    secret,
  });
```

#### Updating Cookie Options

One key difference between the `createCookieStorageAdapter` function and the other storage adapter functions is that its `setCookieStorageState` function takes an additional parameter: the `cookie options`. This allows you to update the initial cookie options when setting the cookie value. This is useful when you want to update the `max-age` or `expires` options of the cookie.

```typescript
const store = createStore(getCookieStorageState);

store.$sub((value) => {
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

## Contributions

All contributions are welcome and appreciated. Thank you! 💚

## License

This library is [licensed][licensed] under the [BSD-3-Clause][bsd-3-clause]. See the [LICENSE](LICENSE) file for more information.

[adapter]: https://blog.stackademic.com/mastering-the-adapter-design-pattern-c118e90f696b
[api]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction
[asynchronous]: https://www.pluralsight.com/resources/blog/guides/introduction-to-asynchronous-javascript
[browser-storage]: https://javascript-conference.com/blog/web-browser-storage/
[bsd-3-clause]: https://opensource.org/licenses/BSD-3-Clause
[callback]: https://builtin.com/software-engineering-perspectives/callback-function
[cdn]: https://www.cloudflare.com/en-gb/learning/cdn/what-is-a-cdn/
[cookies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
[html]: https://developer.mozilla.org/en-US/docs/Web/HTML
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
[react-hook]: https://react.dev/reference/react/hooks
[session-storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[side-effects]: https://monsterlessons-academy.com/posts/what-are-side-effects-in-javascript-what-are-pure-functions
[typeScript]: https://www.typescriptlang.org
[web-application]: https://aws.amazon.com/what-is/web-application/
[web-browser]: https://www.ramotion.com/blog/what-is-web-browser/
[web-storage]: https://www.ramotion.com/blog/what-is-web-storage/
[xml]: https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction
[yarn]: https://yarnpkg.com/
