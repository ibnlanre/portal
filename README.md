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
  - [Persistent mechanisms](#persistent-mechanisms)
    - [Modifying the `local` hook](#modifying-the-local-hook)
    - [Modifying the `session` hook](#modifying-the-session-hook)
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

| Module             | Description                                                      |
|--------------------|------------------------------------------------------------------|
| `portal`           | Create a portal for accessing and updating states                |
| `createBuilder`    | Create a builder object for defining keys and values             |
| `atom`             | A utility for creating isolated states outside a component       |
| `cookieStorage`    | An object representing the Cookie Storage API                    |
| `debounceEffect`   | A utility for creating a debounced effect in React               |

### Importing a module

The following code snippet demonstrates how to import a module from `@ibnlanre/portal`:

```typescript
import { portal } from "@ibnlanre/portal";
```

## Portal

Portal is a utility that facilitates sharing and accessing state across components. It is a wrapper around the `useState` hook, and returns a tuple containing the state and a function to update the state. It accepts a key and an optional configuration object. The configuration object can have the following properties:

- `state`: The initial state of the portal. It can be a primitive value, an object, or an array. Technically, it can be any value.
- `get`: A function that accepts the current state as an argument and returns a value. The value is used to override the initial state.
- `set`: A side effect that accepts the current state as its argument. It is invoked when the state changes.
- `select`: A function that transforms the current state into a different value. It is invoked when the state changes.

### Difference between `state` and `get` properties

The difference between the `state` and `get` properties is that the `state` property is expected to be a pure value that doesn't involve any side effects. it is passed to a `useState` hook as the initial state of the `portal`. The `get` property, on the other hand, can be used to retrieve the initial state from a persistent storage, or network request. It is called within a `useEffect` hook. The `get` property is therefore invoked after the `state` is set, and overrides the `state` if present.

### Basic usage

A configuration object can be passed to the `portal` function to define the initial state and how the state is updated. It is however not required. If a configuration object is not passed to the `portal` function, the initial state is set to `undefined`. The following code snippet demonstrates how to use the `portal` function without a configuration object:

```typescript
const [name, setName] = portal.use("client")
```

#### Using the `state` property

The `state` property is used to define the initial state of the portal. It has the same signature as the argument passed to a `useState` hook. It can be a function that returns a value, an object, an array, or a primitive value. The function should not have any side effects. The following code snippet demonstrates how to use the `state` property:

```typescript
const [name, setName] = portal.use("client", {
  state: "John Doe"
});

const [name, setName] = portal.use("client", {
  state: () => "Jane Doe"
});
```

#### Using the `get` property

The `get` property can be used to retrieve the initial state from a persistent storage. The `get` function accepts the current state as an argument and sets the returned value as the next state of the portal. The following code snippet demonstrates how to use the `get` property:

```typescript
const [name, setName] = portal.use("client", {
  get: (state) => {
    const value = cookieStorage.getItem("client");
    if (value) return JSON.parse(value) as string
    return state;
  }
});
```

#### Using the `set` property

The `set` property is a side effect that can be used to update the browser store when the state changes. It is also called when the portal is instantiated. The `set` function accepts the current state as an argument. The following code snippet demonstrates how to use the `set` property:

```typescript
const [name, setName] = portal.use("client", {
  set: (state) => {
    const value = JSON.stringify(state);
    cookieStorage.setItem("client", value);
  }
});
```

#### Using the `state`, `get`, and `set` properties

The `state`, `get`, and `set` properties can be used together to define the initial state, how the initial state is retrieved, and how the state is persisted. A good practice is to define the `get` function before the `set` function, because of type inference. The following code snippet demonstrates how to use the `state`, `get`, and `set` properties:

```typescript
const [name, setName] = portal.use("client", {
  state: "John Doe",
  get: (state) => {
    const value = cookieStorage.getItem("client");
    if (value) return JSON.parse(value) as string
    return state;
  },
  set: (state) => {
    const value = JSON.stringify(state);
    cookieStorage.setItem("client", value);
  }
});
```

#### Using the `select` property

The `select` property is used to transform the current state into a different value. The `select` function accepts the current state as an argument and returns a value. The following code snippet demonstrates how to use the `select` property:

```typescript
const [name, setName] = portal.use("client", {
  select: (state) => state.toUpperCase()
});
```

### Persisting state

Rather than using a configuration object to persist the state, `portal` provides utility hooks to do so. The following code snippet demonstrates how to persist the state without a configuration object:

#### Using the `local` hook

The `local` hook is used to persist the state in `localStorage`. The following code snippet demonstrates how to use the `local` hook:

```typescript
const [name, setName] = portal.local("client");
```

#### Using the `session` hook

The `session` hook is used to persist the state in `sessionStorage`. The following code snippet demonstrates how to use the `session` hook:

```typescript
const [name, setName] = portal.session("client");
```

#### Using the `cookie` hook

The `cookie` hook is used to persist the state in `document.cookie`. The following code snippet demonstrates how to use the `cookie` hook:

```typescript
const [name, setName] = portal.cookie("client", {
 path: "/"
});
```

### Persistent mechanisms

The persistent mechanisms are the underlying storage mechanisms used by the `local`, `session`, and `cookie` hooks. Internally, each of the persistent hooks uses the `set` and `get` properties to modify the state, before it is used. The `get` function is called on the retrieved value before it is set as the next state. While, the `set` function is called on the current state before it is passed to the browser storage. The following code snippet demonstrates how the persistent mechanisms is implemented:

```typescript
const {
  set = (value: State) => JSON.stringify(value),
  get = (value: string) => JSON.parse(value),
} = { ...config };
```

#### Modifying the `local` hook

The `local` hook uses the `localStorage` API to persist the state. The `localStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `local` hook:

```typescript
const [name, setName] = portal.local("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

#### Modifying the `session` hook

The `session` hook uses the `sessionStorage` API to persist the state. The `sessionStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `session` hook:

```typescript
const [name, setName] = portal.session("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
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
      baz: "qux"
    },
    rim: "raf"
  },
};
```

#### Register keys and values

The keys of a register are the possible keys of a portal. And the values of a register are the possible values of a portal, based on those keys. The pairs generated from the register include the following properties:

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
      baz: "nim"
    },
    rim: "fur"
  }
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

## `atom`

atom is a standalone state container that can be accessed and modified from anywhere in your application. It uses the same underlying mechanism as the `portal` function for reactivity, but is designed to replicate the behavior of the useEffect hook outside of React Components. It accepts a configuration object as its argument. The configuration object can have the following properties:

- `state`: The initial state of the atom. It can be a primitive value, an object, or an array. In order words, it can be any value.
- `events`: An object containing functions that can be used to update the state of the atom. The functions are called events because they are triggered when the state of the atom changes.
- `context`: An object containing states that do not influence the state of the atom. The states are called context because they are made available during instantiation and usage.
- `debug`: A boolean value that determines if the atom should log its state to the console.
- `debounce`: A set of options that determines the how the `use` event is triggered.

### atom `state`

`atoms` are typically created outside of React Components, and used within the context of a React component. It takes a configuration object as its argument, defining the `state`, `context` and `events` of the atom.

#### Using a `state` value

The `state` property is required, as it is used to determine the initial state and type of the atom. The following code snippet demonstrates how to create an `atom`:

```typescript
const counterAtom = atom({
  state: 10,
});
```

#### Using a `state` callback

The `state` property can either be a value or a callback that returns a value. The callback takes the `context` as an argument, and the returned value is used as the initial state of the atom. The `context` property, if not defined, is an empty object. The following code snippet demonstrates how to use a `state` callback:

```typescript
const counterAtom = atom({
  state: () => 10,
});
```

### atom `events`

The `events` property is an object containing functions that can be used to manipulate the state of the atom. There are three key events: `set`, `get`, and `use`. The following code snippet demonstrates how to use the `events` property:

- The state of the atom is retrieved from `localStorage`. This does not cause hydration problems because the state is calculated at the point of creating the atom. The returned value is set as the initial state of the atom.
- The `set` event is triggered when the state of the atom is updated. It is used to persist the state of the atom in `localStorage`. The returned value is set as the new state of the atom.
- The `get` event is triggered when the state of the atom is accessed, within a React Component. It is used to convert the state of the atom to a string. This conversion does not affect the state of the atom.
- The `use` event is triggered when the atom is used within a React Component. It is called only once, when the component mounts. It is used to increment the state of the atom every second. It returns a function that is used to clear the interval, which would be called when the component unmounts.

```typescript
const counterAtom = atom({
  state: () => {
    const value = localStorage.getItem("counter");
    if (value) return JSON.parse(value);
    return 0;
  },
  events: {
    set: ({ value }) => {
      localStorage.setItem("counter", JSON.stringify(value));
      return value;
    },
    get: ({ value }) => value.toString(),
    use: ({ set }) => {
      const interval = setInterval(() => {
        set((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    },
  },
});
```

#### `.set`

The `set` event is triggered when the state of the atom is about to be updated. This event can be used to modify the state of the atom before it is set or persist the state of the atom at the point of update. It expects a callback, which accepts a `params` object as its argument and returns a value. The returned value becomes the new state of the atom. The `params` object includes the following properties:

- `value`: The state about to be set.
- `previous`: The current state of the atom.
- `ctx`: The context of the atom.
- `emit`: A function used to update the context of the atom.

#### Using the `set` event

A `set` function, which internally calls the `set` event, is made accessible within the `fields` parameter of the `use` effect of the atom. This ensures that the `set` event is called when the state of the atom is updated. To bypass the `set` event from being called, you can use the `publish` function instead, to immediately update the state. The following code snippet demonstrates how to use the `set` event:

```typescript
const capitalizeAtom = atom({
  state: "",
  events: {
    set: ({ value }) => value.slice(0, 1).toUpperCase() + value.slice(1),
  },
});

const [name, setName] = capitalizeAtom.use();

useEffect(() => {
  setName("john doe");
}, []);

// name = "John doe"
```

#### `.get`

The `get` event is triggered when the state of the atom is accessed, within a React Component. This event can be used to modify the state of the atom before it is retrieved. The `get` function accepts a `params` object as its first argument and an arbitrary number of arguments as its second. The `params` object includes the following properties:

- `value`: The state about to be retrieved.
- `previous`: The current state of the atom.
- `ctx`: The context of the atom.
- `emit`: A function used to update the context of the atom.

#### Using the `get` event

The arbitrary number of arguments are expected to be passed on the `use` hook, via its `getArgs` property. These arguments can be seen as dependencies of the `get` event. The following code snippet demonstrates how to use the `get` event, with dependencies:

```typescript
const counterAtom = atom({
  state: 10,
  events: {
    get: ({ value }, increment: number, decrement: number) => {
      return value + increment - decrement
    },
  },
});

const [counter, setCounter] = counterAtom.use({ getArgs: [10, 2] });
// counter = 18
```

#### `.use`

The `use` event is a wrapper around the `useEffect` hook. It is suitable for executing side effects, such as network requests, and WebSocket connections. The `use` event accepts the properties returned by the `atom` function as its first argument, and an arbitrary number of arguments as its second. The object of parameters includes the following properties:

##### State properties

- `value`: The current state of the atom.
- `subscribe`: A function used to subscribe to the state of the atom.
- `publish`: A function used to update the state of the atom without triggering the `set` event.
- `timeline`: Provides access to the previous states of the atom.
- `set`: A function used to update the state of the atom.

##### Context propeties

- `ctx`: The context of the atom.
- `provide`: A function used to subscribe to the context of the atom.
- `emit`: A function used to update the context of the atom.

##### Garbage collection

- `on`: An object containing functions for managing garbage collection.
- `dispose`: A function used to trigger garbage collection.

#### Using the `use` event

The `use` event is triggered as a result of an atom being used in a React Component. It is invoked when the component mounts, and when the dependencies passed through the `use` hook changes. The following code snippet demonstrates how to use the `use` event:

```typescript
const dataAtom = atom({
  state: ["John Doe", "Jane Doe"],
  events: {
    use: ({ publish }, search: string = "") => {
      const abortController = new AbortController();

      const url = new URL("http://example.com/contact");
      if (search) url.searchParams.set("filter", search);
      else url.searchParams.delete("filter");

      fetch(url.toString(), {
        signal: abortController.signal,
      })
        .then(response => response.json())
        .then(publish)
        .catch((error) => {
          console.error('Error:', error.message);
        });

      return () => {
        abortController.abort();
      }
    },
  },
});
```

The arbitrary number of arguments are expected to be passed on the `use` hook, via its `useArgs` property. These arguments can be seen as dependencies of the `use` event. If the `enabled` property of the `use` hook is set to `false`, the `use` event will not triggered. It is however `true` by default. The following code snippet demonstrates how to use the `use` hook, with the `useArgs` property:

```tsx
const [search, setSearch] = useState("");
const [data, setData] = dataAtom.use({ useArgs: [search] });

return (
  <input onChange={(event) => setSearch(event.target.value)} />
);
```

### atom `context`

The `context` property is an object containing **reactive** states that do not influence the state of the atom. The `context` property is made available during instantiation and usage. The following code snippet demonstrates how to use the `context` property:

```typescript
const counterAtom = atom({
  state: ["John Doe", "Jane Doe"],
  context: {
    isLoading: false,
    isError: false,
  },
  events: {
    set: ({ value }) => decrypt(value),
    use: ({ emit, set }, search: string = "") => {
      const abortController = new AbortController();
      emit({ isLoading: true });

      const url = new URL("http://example.com/contact");
      if (search) url.searchParams.set("filter", search);
      else url.searchParams.delete("filter");

      fetch(url.toString(), {
        signal: abortController.signal,
      })
        .then(response => response.json())
        .then((data) => {
          set(data);
          emit({ isLoading: false });
        })
        .catch((error) => {
          emit({ isError: true, isLoading: false });
          console.error('Error:', error.message);
        });

      const cleanup = () => {
        abortController.abort();
        emit({ isError: false, isLoading: false });
      }

      return {
        rerun: cleanup,
        unmount: cleanup,
      }
    },
  },
});
```

The `emit` function is used to update the context of the atom. It can accept partial values, which are merged with the current context of the atom. Rather than using a `set` function, the `publish` function is used to update the state of the atom. This is because the `set` event is not defined.

```typescript



#### Using the `set` event

The `set` event is triggered when the state of the atom is updated. It accepts a callback as its argument. The callback accepts the current state as its argument and returns a value. The returned value is used to update the state of the atom. The following code snippet demonstrates how to use the `set` event:

```typescript

This following code snippet demonstrates an advanced example using TypeScript. It defines two atoms, `messagesAtom` and `userAtom`, which are part of a state management system.

```typescript
const messagesAtom = atom({
  state: {} as Messages,
  events: {
    get: ({ value }) => value?.messages?.at(0)?.last_24_hr_data,
    set: ({ value }) => decrypt(value),
  },
});
```

`messagesAtom` is initialized with an empty object as its state and has two events:

- `get`: Retrieves the `last_24_hr_data` property from the `messages` object.
- `set`: Decrypts the provided value before setting it as the new state.

```typescript
export const userAtom = atom({
  state: {} as UserData,
  events: {
    set: ({ value }) => decrypt(value),
    use: ({ on, set, ctx }, user: string) => {
      const { getUrl } = ctx;
      const ws = new WebSocket(getUrl(user));
      ws.onmessage = ((value) => set(JSON.parse(value.data)));
      on.rerun(() => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
      })
    },
  },
  context: {
    getUrl: (user: string) => {
      return builders.use().socket.users(user);
    },
  },
});
```

`userAtom` is initialized with an empty object as its state and has three events:

- `set`: Decrypts the provided value before setting it as the new state.
- `use`: Accepts a `user` string parameter and establishes a WebSocket connection using the `getUrl` function from the context. It listens for incoming messages and updates the state accordingly. It also closes the WebSocket connection when the `on` event is rerun.
- `context`: Provides a `getUrl` function that returns a URL based on the `user` parameter.

```typescript
// Atoms are typically used within the context of a React component
const [messages, setMessages] = messagesAtom.use();
const [users, setUsers] = userAtom.use({ useArgs: [messages.user] });
```

### To create a `builder` pattern for property access

To create a nested record with a `key` and `value` pair, you can use the following code:

```typescript
const store = {
  foo: {
    baz: (id: number) => `/bazaar/${id}`,
    bar: 10,
  },
};

const builder = createBuilder(store);
```

To access the keys of the `builder` object, you can use the following code:

```typescript
// `use` expects that the required arguments are passed.
builder.foo.baz.use(11); // ["foo", "baz", 11]

// `get` retrieves the keys without invoking the function.
builder.foo.baz.get(); // ["foo", "baz"]

// `get` also allows you to add more keys
builder.foo.baz.get("test"); // ["foo", "baz", "test"]
```

To retrieve nested `values`, you can use the following code:

```typescript
builder.use(); // store
builder.use().foo.baz(12); // "/bazaar/12"
builder.use().foo.bar; // 10
```

To add a prefix to the keys, you can use the following code:

```typescript
const builderWithPrefix = createBuilder(store, "tap", "root");
builderWithPrefix.foo.bar.use() // ["tap", "root", "foo", "bar"]
```

To get the type of object passed to the builder

```typescript
const builder = createBuilder(store);

// Note that the actual value of builder.is is undefined.
type StoreType = typeof builder.is;

// Ease of use accessing the type of nested properties.
type BarType = typeof builder.is.foo.bar;
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

```typescript

const userAtom = atom({
  state: { name: "John Doe" },
  events: {
    use: ({ set }) => {
      const interval = setInterval(() => {
        set((prev) => ({ ...prev, name: "Jane Doe" }));
      }, 1000);

      return {
        unmount: () => clearInterval(interval),
      };
    },
  },
  context: {
    isLoading: false,
  },
});

const [value, { isLoading: isLoadingContext }] = userAtom.use();
const { user, setUser, isLoading } = userAtom.use({
  key: "user",
});
```
