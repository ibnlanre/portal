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
  - [Local Storage](#local-storage)
  - [Session Storage](#session-storage)
  - [Cookie Storage](#cookie-storage)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use either a CDN, or a package manager. Run the following command within your project directory. The library is written in TypeScript and ships with its own type definitions, so you don't need to install any type definitions.

### Using package managers

If you are working on a project that uses a package manager, you can copy one of the following commands to install `@ibnlanre/portal` using your preferred package manager:

#### `yarn`

```shell
yarn add @ibnlanre/portal
```

#### `npm`

```shell
npm i @ibnlanre/portal
```

#### `pnpm`

```bash
pnpm i @ibnlanre/portal
```

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

## Core Features

### Create Store

Create a store to manage application state:

```typescript
import { createStore } from "@ibnlanre/portal";

// Basic store with primitive value
const store = createStore("initial value");

// Object store
const store = createStore({ key: "value" });

// Nested state
const store = createStore({
  location: {
    address: {
      street: "123 Main St",
    },
  },
});
```

### Accessing State

Get state values using $get:

```typescript
const value = store.$get(); // Get full state
const street = store.$get("location.address.street"); // Get nested value
```

### Updating State

Update state using $set:

```typescript
const setValue = store.$set();
setValue("new value");

// Update nested value
const setStreet = store.$set("location.address.street");
setStreet("456 Elm St");
```

### React Integration

Use state in React components:

```typescript
function Component() {
  // Get state
  const [value, setValue] = store.$use();
  // or get nested value
  const [street, setStreet] = store.$use("location.address.street");

  // Update state
  const handleChange = (event) => setValue(event.target.value);

  // or update nested value
  const handleStreetChange = (event) => {
    return setStreet((prev) => {
      if (event.target.value === " ") return prev;
      return event.target.value;
    });
  };

  return (
    <div>
      <input value={value} onChange={handleChange} />
      <input value={street} onChange={handleStreetChange} />
    </div>
  );
}
```

## Storage Integration

### Local Storage Adapter

```typescript
// Create local storage adapter
const [setLocalStorageState, getLocalStorageState] =
  createLocalStorageAdapter("storage-key");

// Create store with local storage
const store = createStore(getLocalStorageState);

// or with a fallback state
const store = createStore(() => getLocalStorageState(fallbackState));

// subscribe to store changes
store.$sub(setLocalStorageState);
```

### Session Storage Adapter

```typescript
// Create session storage adapter
const [setSessionStorageState, getSessionStorageState] =
  createSessionStorageAdapter("storage-key");

// Create store with session storage
const store = createStore(getSessionStorageState);

// or with a fallback state
const store = createStore(() => getSessionStorageState(fallbackState));

// subscribe to store changes
store.$sub(setSessionStorageState);
```

### Cookie Storage Adapter

```typescript
const store = createStore(initialState, {
  storage: createCookieStorageAdapter("cookie-key", {
    path: "/",
    domain: "example.com",
  }),
});

// Create store with cookie storage
const [setCookieStorageState, getCookieStorageState] =
  createCookieStorageAdapter("cookie-key", {
    path: "/",
    domain: "example.com",
  });

// Create store with cookie storage
const store = createStore(getCookieStorageState);

// or with a fallback state
const store = createStore(() => getCookieStorageState(fallbackState));

// subscribe to store changes
store.$sub(setCookieStorageState);

// with options
store.$sub((value) =>
  setCookieStorageState(value, {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    secure: true,
    httpOnly: true,
  })
);
```

## Cookie Storage

The `cookieStorage` module provides a set of functions to manage cookies in a web application. It includes functionalities to set, get, remove, and clear cookies, as well as to sign and unsign cookie values for added security.

### Functions

- **sign(value: string, secret: string): string**

  - Signs a cookie value using a secret key.
  - Parameters:
    - `value`: The cookie value to be signed.
    - `secret`: The secret key used to sign the cookie.
  - Returns: The signed cookie value.

- **unsign(signedValue: string, secret: string): string**

  - Unsigns a signed cookie value using a secret key.
  - Parameters:
    - `signedValue`: The signed cookie value to be unsigned.
    - `secret`: The secret key used to unsign the cookie.
  - Returns: The original cookie value.

- **getItem(key: string): string**

  - Retrieves the value of a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to retrieve.
  - Returns: The value of the cookie.

- **setItem(key: string, value: string): void**

  - Sets the value of a cookie.
  - Parameters:
    - `key`: The key of the cookie to set.
    - `value`: The value to set for the cookie.

- **removeItem(key: string): void**

  - Removes a cookie by its key.
  - Parameters:
    - `key`: The key of the cookie to remove.

- **clear(): void**

  - Clears all cookies.

- **key(index: number): string**

  - Retrieves the key of a cookie by its index.
  - Parameters:
    - `index`: The index of the cookie to retrieve the key for.
  - Returns: The key of the cookie.

- **length: number**
  - Retrieves the number of cookies stored.
  - Returns: The number of cookies.

### Usage

To use the `cookieStorage` module, import it and call the desired functions:

```typescript
import { cookieStorage } from "@ibnlanre/portal";

// Sign a cookie value
const signedValue = cookieStorage.sign("value", "secret");

// Unsign a cookie value
const originalValue = cookieStorage.unsign(signedValue, "secret");

// Set a cookie value
cookieStorage.setItem("key", "value");

// Get a cookie value
const value = cookieStorage.getItem("key");

// Remove a cookie
cookieStorage.removeItem("key");

// Clear all cookies
cookieStorage.clear();

// Get a cookie key by index
const key = cookieStorage.key(0);

// Get the number of cookies stored
const length = cookieStorage.length;
```

## License

MIT
