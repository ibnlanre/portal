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
  - [Subscribing to State Changes with `$sub`](#subscribing-to-state-changes-with-sub)
    - [Unsubscribing from State Changes](#unsubscribing-from-state-changes)
    - [Preventing Immediate Callback Execution](#preventing-immediate-callback-execution)
  - [Nested Stores](#nested-stores)
    - [Breaking Off Stores](#breaking-off-stores)
    - [Updating Nested Stores](#updating-nested-stores)
  - [Accessing Nested Stores with `$tap`](#accessing-nested-stores-with-tap)
  - [Asynchronous State](#asynchronous-state)
  - [React Integration](#react-integration)
    - [Modifying State with a Callback](#modifying-state-with-a-callback)
    - [Using Dependencies with the `$use` Hook](#using-dependencies-with-the-use-hook)
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

### Managing State

State management with `@ibnlanre/portal` begins with the `createStore` function. This function initializes a store with an initial value and returns an object containing [methods][method] to interact with the state: [$get](#accessing-state-with-get), [$set](#updating-state-with-set), [$use](#react-integration), [$sub](#subscribing-to-state-changes-with-sub), and [$tap](#accessing-nested-stores-with-tap).

These [methods][method] provide a simple and consistent way to access, update, and subscribe to state changes. Here's an example of creating a store:

```typescript
import { createStore } from "@ibnlanre/portal";

const store = createStore("initial value");
```

Each [method][method] serves a distinct purpose:

- `$get`: Retrieve the current state.
- `$set`: Update the state with a new value.
- `$use`: A [React][react] [hook][hook] for managing state within functional components.
- `$sub`: Subscribe to state changes to react to updates.
- `$tap`: Access deeply nested stores using a dot-separated string.

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

### Subscribing to State Changes with `$sub`

In addition to accessing and updating state, `@ibnlanre/portal` provides the `$sub` [method][method] to subscribe to state changes. This allows you to react to updates and perform [side effects][side-effects] when the state changes.

```typescript
store.$sub((value) => console.log(value));
```

#### Unsubscribing from State Changes

The `$sub` [method][method] returns an `unsubscribe` function that can be called to stop listening for updates. This is particularly useful when a component unmounts or when you no longer need the subscription.

```typescript
const unsubscribe = store.$sub((value) => {
  console.log(value);
});

// Stop listening to state changes
unsubscribe();
```

#### Preventing Immediate Callback Execution

By default, the `$sub` [callback][callback] is invoked immediately after subscribing. To disable this behavior, pass `false` as the second argument. This ensures the callback is only executed when the state changes.

```typescript
store.$sub((value) => {
  console.log(value);
}, false);
```

### Nested Stores

`@ibnlanre/portal` supports the creation of **nested stores**, allowing you to manage deeply structured state with ease. To create a nested store, pass an object containing nested objects, arrays, or primitive values to the `createStore` function. Each node in the nested structure becomes its own store, with access to [methods][method] for updating and managing its state.

This design enables fine-grained control over state at any level of the object hierarchy.

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

const city = store.location.address.city.$get();
console.log(city); // "Springfield"
```

#### Breaking Off Stores

Remember that each point in an object chain is a store. This means that each member of the chain has access to its own value and can be **broken off** into its own store at any point in time. This is useful when you want to work with a nested state independently of the parent store.

For example, you can break off the `address` store from the `location` store and work with it independently:

```typescript
const { address } = store.location;
address.street.$get(); // "123 Main St"

const { street } = address;
street.$set("456 Elm St");
```

#### Updating Nested Stores

Updating the state of a nested store works the same way as updating a regular store. You can use the $set method to change the value of a nested store. Since all levels in the hierarchy share the same underlying state, updates made to a nested store will propagate to the parent store.

This behavior is by design, allowing you to work with any part of the state seamlessly.

```typescript
const { street } = store.location.address;

street.$set("456 Elm St");
street.$set((prev) => `${prev} Apt 2`);
```

### Accessing Nested Stores with `$tap`

To conveniently access deeply nested stores, you can use the `$tap` method with a dot-separated string. This method leverages [TypeScript][typescript]'s IntelliSense for path suggestions, providing an overview of the available nested stores. This makes managing complex state structures more intuitive and efficient.

```typescript
const street = store.$tap("location.address.street");
street.$get(); // 456 Elm St
```

The `$tap` method returns a reference to the nested store, which means you can access and update the nested state directly. You also can **_tap_** at any level of the hierarchy, allowing you to work with deeply nested stores without the need for manual traversal.

```typescript
store.$tap("location.address.street").$set("789 Oak St");

const { street } = store.location.$tap("address");
street.$get(); // 789 Oak St
```

### Asynchronous State

The `createStore` function also supports [asynchronous][asynchronous] state initialization. You can pass an async function that returns a [Promise][promise] resolving to the initial state. This is particularly useful for scenarios where the initial state needs to be fetched from an external API.

**Note** that the store will remain empty until the [Promise][promise] resolves. Also, if the resolved value is an object, it will be treated as a primitive value, not as a nested store. This is because nested stores are only created during [initialization][initialization] from objects directly passed to createStore.

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

`@ibnlanre/portal` offers first-class support for [React][react] applications, making state management seamless within functional components. When you create a store, it automatically provides a [React][react] [hook][hook] called `$use`. This [hook][hook] is similar to the [useState][use-state] [hook][hook] in [React][react], returning an array with two elements: the **current state value** and a **dispatch function** to update the state.

Here's how you can integrate the `$use` [hook][hook] into your [React][react] components:

```typescript
import type { ChangeEvent } from "react";
import { store } from "./path-to-your-store";

function Component() {
  const [state, setState] = store.$use();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  return <input value={state} onChange={handleChange} />;
}

export default Component;
```

The `$use` [hook][hook] eliminates the need for manual subscriptions to state changes. It ensures that the component automatically updates whenever the store's state changes and gracefully unsubscribes when the component unmounts. This simplifies state management within your application.

#### Modifying State with a Callback

Like the `$get` and `$set` methods, the `$use` [hook][hook] can accept a [callback function][callback] as its first argument. This function is called after the state is retrieved from the store but before it is returned to the component. This allows you to transform or modify the state before using it.

```typescript
const [state, setState] = store.$use((value) => `${value} modified`);
```

**Note** that the [callback function][callback] does not alter the store's state. Instead, it modifies the value returned for use within the component. Also, the dispatch function (`setState`) expects values of the same type as the store's initial state, ensuring type safety.

#### Using Dependencies with the `$use` Hook

In cases where the result of the callback function depends on other mutable values, you can pass a **dependency array** as the second argument to the `$use` hook. This ensures the [callback function][callback] is only re-evaluated when dependencies change.

```typescript
const [count, setCount] = useState(0);

const [state, setState] = store.$use(
  (value) => `Count: ${count} - ${value}`,
  [count]
);
```

**Note** that this **dependency array** works like that in [React][react]'s [useEffect][use-effect] or [useMemo][use-memo] hooks. The [callback function][callback] is memoized and only re-executed when the specified dependencies change. Also, the modified state returned by the callback is independent of the store's internal state. This ensures that the store's state remains unchanged.

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
[hook]: https://react.dev/reference/react/hooks
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
[session-storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[side-effects]: https://monsterlessons-academy.com/posts/what-are-side-effects-in-javascript-what-are-pure-functions
[signing]: https://bloggle.coggle.it/post/190706036692/what-weve-learned-from-moving-to-signed-cookies
[typeScript]: https://www.typescriptlang.org
[use-effect]: https://react.dev/reference/react/useEffect
[use-memo]: https://react.dev/reference/react/useMemo
[use-state]: https://react.dev/reference/react/useState
[web-application]: https://aws.amazon.com/what-is/web-application/
[web-browser]: https://www.ramotion.com/blog/what-is-web-browser/
[web-storage]: https://www.ramotion.com/blog/what-is-web-storage/
[xml]: https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction
[yarn]: https://yarnpkg.com/
