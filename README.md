# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes) and [Tanstack Query](https://tanstack.com/query/latest), `@ibnlanre/portal` is a simple **application** state management library for managing component state on a global level.

## Table of Contents

- [Installation](#installation)
  - [Using package managers](#using-package-managers)
    - [`yarn`](#yarn)
    - [`npm`](#npm)
    - [`pnpm`](#pnpm)
  - [Using a CDN](#using-a-cdn)
    - [`unpkg`](#unpkg)
    - [`jsDelivr`](#jsdelivr)
- [Usage](#usage)
  - [Importing a module](#importing-a-module)
- [Portal](#portal)

  - [Difference between `state` and `get` properties](#difference-between-state-and-get-properties)
  - [Basic usage](#basic-usage)
    - [Using the `state` property](#using-the-state-property)
    - [Using the `get` property](#using-the-get-property)
    - [Using the `set` property](#using-the-set-property)
    - [Using the `state`, `get`, and `set` properties](#using-the-state-get-and-set-properties)
    - [Using the `select` property](#using-the-select-property)
  - [Persisting state](#persisting-state)
    - [Using the `local` hook](#using-the-local-hook)
    - [Modifying the `local` hook](#modifying-the-local-hook)
    - [Using the `session` hook](#using-the-session-hook)
    - [Modifying the `session` hook](#modifying-the-session-hook)
    - [Using the `cookie` hook](#using-the-cookie-hook)
    - [Modifying the `cookie` hook](#modifying-the-cookie-hook)
  - [Portal register](#portal-register)
    - [Register keys and values](#register-keys-and-values)
    - [Creating a typed portal using a register](#creating-a-typed-portal-using-a-register)
    - [Using a typed portal](#using-a-typed-portal)
    - [Using the configuration object](#using-the-configuration-object)
    - [Persisting a typed portal](#persisting-a-typed-portal)
  - [Updating the state of a portal](#updating-the-state-of-a-portal)
    - [Using the `setState` function](#using-the-setstate-function)
    - [Callbacks as arguments to `setState`](#callbacks-as-arguments-to-setstate)
  - [Portal utilities](#portal-utilities)
    - [`.entries`](#entries)
    - [`.hasItem`](#hasitem)
    - [`.getItem`](#getitem)
    - [`.setItem`](#setitem)
    - [`.removeItem`](#removeitem)
    - [`.clear`](#clear)

- [Atom](#atom)
- [Author](#author)
- [Contributions](#contributions)
- [Release](#release)
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

## Usage

The following is an overview of the modules available in the `@ibnlanre/portal` library:

| Module           | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `portal`         | Create a portal for accessing and updating states          |
| `createBuilder`  | Create a builder object for defining keys and values       |
| `atom`           | A utility for creating isolated states outside a component |
| `cookieStorage`  | An object representing the Cookie Storage API              |
| `debounceEffect` | A utility for creating a debounced effect in React         |

### Importing a module

The following code snippet demonstrates how to import a module from `@ibnlanre/portal`:

```typescript
import { portal } from "@ibnlanre/portal";
```

## Portal

`Portal` is a utility that facilitates sharing and accessing state across components. It eliminates the need for prop drilling, and the `context` API. Furthermore, it does not require a provider, or a consumer. It is a simple function that returns a tuple containing the state and a function to update the state. `Portal` accepts a key and an optional configuration object. The configuration object can have the following properties:

- `state`: The initial state of the portal. It can be a primitive value, an object, or an array. Technically, it can be any value.
- `get`: A function that accepts the current state as an argument and returns a value. The value is used to override the initial state.
- `set`: A side effect that accepts the current state as its argument. It is invoked when the state changes.
- `select`: A function that transforms the current state into a different value. It is invoked when the state changes.

### Difference between `state` and `get` properties

The difference between the `state` and `get` properties is that the `state` property is expected to be a pure value that doesn't involve any side effects. it is passed to a `useState` hook as the initial state of the `portal`. The `get` property, on the other hand, can be used to retrieve the initial state from a persistent storage, or network request. It is called within a `useEffect` hook, and is therefore invoked after the `state` is set, and overrides the `state` if present.

### Basic usage

While `portal` itself is an object containing a couple of utility functions, creating states requires the `use` hook. The `use` hook accepts a key and an optional configuration object as its arguments. The configuration object defines the initial state of the portal, and how the state is treated.

It returns a tuple containing the state and a function to update the state. The following code snippet demonstrates how to use the `portal` function:

````typescript
A configuration object can be passed to the `portal` function to define the initial state and how the state is updated. It is however not required. If a configuration object is not passed to the `portal` function, the initial state is set to `undefined`. The following code snippet demonstrates how to use the `portal` function without a configuration object:

```typescript
const [name, setName] = portal.use("client")
````

### Configuration object

The configuration object can have the following properties:

#### Using the `state` property

The `state` property is used to define the initial state of the portal. It has the same signature as the argument passed to a `useState` hook. It can be a function that returns a value, an object, an array, or a primitive value. The function should not have any side effects. The following code snippet demonstrates how to use the `state` property:

```typescript
const [name, setName] = portal.use("client", {
  state: "John Doe",
});

const [name, setName] = portal.use("client", {
  state: () => "Jane Doe",
});
```

#### Using the `get` property

The `get` property can be used to retrieve the initial state from a persistent storage. The `get` function accepts the current state as an argument and sets the returned value as the next state of the portal. The following code snippet demonstrates how to use the `get` property:

```typescript
const [name, setName] = portal.use("client", {
  get: (state) => {
    const value = localStorage.getItem("client");
    if (value) return JSON.parse(value) as string;
    return state;
  },
});
```

#### Using the `set` property

The `set` property is a side effect that can be used to update the browser store when the state changes. It is also called when the portal is instantiated. The `set` function accepts the current state as an argument. The following code snippet demonstrates how to use the `set` property:

```typescript
const [name, setName] = portal.use("client", {
  set: (state) => {
    const value = JSON.stringify(state);
    localStorage.setItem("client", value);
  },
});
```

#### Using the `state`, `get`, and `set` properties

The `state`, `get`, and `set` properties can be used together to define the initial state, how the initial state is retrieved, and how the state is persisted. If the `state` property is not defined, a good practice is to define the `get` function before the `set` function, because of type inference. The following code snippet demonstrates how to use the `state`, `get`, and `set` properties:

```typescript
import { get, set } from "idb-keyval";

const [name, setName] = portal.use("client", {
  state: "John Doe",
  get: async (state) => {
    const value = await get("client");
    if (value) return JSON.parse(value);
    return state;
  },
  set: async (state) => {
    const value = JSON.stringify(state);
    await set("client", value);
  },
});
```

#### Using the `select` property

The `select` property is used to transform the current state into a different value. The `select` function accepts the current state as an argument and returns a value. The following code snippet demonstrates how to use the `select` property:

```typescript
const [name, setName] = portal.use("client", {
  select: (state) => state.toUpperCase(),
});
```

### Persisting state

Rather than using the configuration object to manually persist state, `portal` provides utility hooks to do so. Internally, each of these hooks use the `set` and `get` properties to modify the state, before it is used. The `get` function is called on the retrieved value before it is set as the next state. While, the `set` function is called on the current state before it is passed to the browser storage. The following code snippet demonstrates how the mechanism is implemented **internally**:

```typescript
const {
  set = (value: State) => JSON.stringify(value),
  get = (value: string) => JSON.parse(value),
} = { ...config };
```

#### Using the `local` hook

The `local` hook is used to persist the state in `localStorage`. The following code snippet demonstrates how to use the `local` hook:

```typescript
const [name, setName] = portal.local("client");
```

#### Modifying the `local` hook

The `local` hook uses the `localStorage` API to persist the state. The `localStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `local` hook:

```typescript
const [name, setName] = portal.local("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

#### Using the `session` hook

The `session` hook is used to persist the state in `sessionStorage`. The following code snippet demonstrates how to use the `session` hook:

```typescript
const [name, setName] = portal.session("client");
```

#### Modifying the `session` hook

The `session` hook uses the `sessionStorage` API to persist the state. The `sessionStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `session` hook:

```typescript
const [name, setName] = portal.session("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

#### Using the `cookie` hook

The `cookie` hook is used to persist the state in `document.cookie`. The following code snippet demonstrates how to use the `cookie` hook:

```typescript
const [name, setName] = portal.cookie("client", {
  path: "/",
});
```

#### Modifying the `cookie` hook

The `cookie` hook uses the `cookieStorage` API exposed by this library, to persist the state. The `cookieStorage` API accepts a `key`, `value` and an optional configuration object as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `cookie` hook:

```typescript
const [name, setName] = portal.cookie("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

### Portal register

A register is a record of `key` and `value` pairs. The `key` is a string and the `value` can be any value. The register serves as a store for possible portal keys and values. The following code snippet shows what a register looks like:

```typescript
const register = {
  foo: {
    bar: {
      baz: "qux",
    },
    rim: "raf",
  },
};
```

#### Register keys and values

The nested keys of a register are the possible keys of a portal. And the values of each corresponding key in the register are the possible values of the portal. The pairs generated from the register above include the following properties:

```txt
- foo = { bar: { baz: "qux" }, rim: "raf" }
- foo.bar = { baz: "qux" }
- foo.bar.baz = "qux"
- foo.rim = "raf"
```

#### Creating a typed portal using a register

The `portal` object ships with a `make` function that can be used to create a typed portal outside of React Components, so that it can be exported and used elsewhere. The `make` function accepts a register as an argument and returns a typed portal. The following code snippet demonstrates how to create a typed portal using a register:

```typescript
export const store = portal.make(register);
```

#### Using a typed portal

The register `keys` are used as the keys of the typed portal, and register `values` are used as the initial state of the typed portal. The following code snippet demonstrates how to use a typed portal:

```typescript
const [foo, setFoo] = store.use("foo");
```

#### Using the configuration object

The register `keys` are used as the keys of the typed portal, and register `values` are used as the initial state of the typed portal. A `state` property can be passed to the configuration object to override the initial state of the typed portal, but it must be of the same type as the register `value`. The following code snippet demonstrates how to use a typed portal with a configuration object:

```typescript
const [foo, setFoo] = store.use("foo", {
  state: {
    bar: {
      baz: "nim",
    },
    rim: "fur",
  },
});
```

#### Persisting a typed portal

A typed portal can also be persisted using the `local`, `session`, or `cookie` hooks. It would interest you to know that `portal` itself is a typed portal of `any` type. The following code snippet demonstrates how to persist a typed portal:

```typescript
const [foo, setFoo] = store.local("foo");
```

### Updating the state of a portal

The state of a portal can be updated using the `setState` function returned by the `use` hook. It can also be updated using the `setItem` utility function. The following code snippet demonstrates how to update the state of a portal:

```typescript
const [name, setName] = portal.use("client");
setName("Jane Doe");
```

#### Using the `setState` function

It is advised that you do not use the `setState` function within the top level of a React Component. This is because the `setState` function would trigger a rerender of the component, which would in turn trigger cause infinite rerenders. The `setState` function accepts a value as its argument. The following code snippet demonstrates how to properly use the `setState` function:

```typescript
const [name, setName] = portal.use("client");

useEffect(() => {
  setName("Jane Doe");
}, []);
```

#### Callbacks as arguments to `setState`

The `setState` function also accepts a callback as its argument. The callback accepts the current state as its argument and returns a value. The returned value is used to update the state of the portal. The following code snippet demonstrates how to use a callback as an argument to `setState`:

```typescript
const [name, setName] = portal.use("client");

useEffect(() => {
  setName((prev) => prev.toUpperCase());
}, []);
```

### Portal utilities

The `portal` object ships with a couple of utility functions that can be used to manipulate the state of a portal. The following code snippet demonstrates how to use the `portal` utilities:

#### `.entries`

The `entries` getter is used to retrieve the entries of a portal. It returns a record of `key` and `value` pairs. The following code snippet demonstrates how to use the `entries` getter:

```typescript
const entries = portal.entries;
```

#### `.hasItem`

The `hasItem` utility function is used to check if a portal has a state. It accepts a `key` as its argument and returns a boolean. The following code snippet demonstrates how to use the `hasItem` utility function:

```typescript
const hasName = portal.hasItem("client");
```

#### `.getItem`

The `getItem` utility function is used to retrieve the state of a portal. It accepts a `key` as its argument and returns the state of the portal. The following code snippet demonstrates how to use the `getItem` utility function:

```typescript
const name = portal.getItem("client");
```

#### `.setItem`

The `setItem` utility function is used to update the state of a portal, outside of React Components. It accepts a `key` and a `value` as its arguments. The following code snippet demonstrates how to use the `setItem` utility function:

```typescript
portal.setItem("client", "Jane Doe");
```

#### `.removeItem`

The `removeItem` utility function is used to remove the state of a portal. It accepts a `key` as its argument. The following code snippet demonstrates how to use the `removeItem` utility function:

```typescript
portal.removeItem("client");
```

#### `.clear`

The `clear` utility function is used to remove all the states of a portal. The following code snippet demonstrates how to use the `clear` utility function:

```typescript
portal.clear();
```

## Author

Ridwan Olanrewaju, [root.i.ng](https://www.root.i.ng), [@ibnlanre](https://linkedin.com/in/ibnlanre)

## Contributions

All contributions are welcome and appreciated. Thanks for taking the time to contribute to `@ibnlanre/portal` 💚

## Release

```shell
git add . # stages the changes made.
yarn package # builds and deploy.
```

## License

This library is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```txt
Feel free to customize the content according to your needs. But, do leave a shoutout. Thanks! 😊.
```
