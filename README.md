# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes) and [Tanstack Query](https://tanstack.com/query/latest), `@ibnlanre/portal` is a simple **application** state management library for managing component state on a global level.

## Table of Contents

- [Installation](#installation)
- [API](#api)
- [Usage](#usage)
- [Author](#author)
- [Contributions](#contributions)
- [Release](#release)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use npm or yarn. Run the following command in your project directory:

```shell
npm install @ibnlanre/portal
```

or

```shell
yarn add @ibnlanre/portal
```

## API

The following is an overview of the utility functions and hooks available in the portal module.

| Function           | Description                                                      |
|--------------------|------------------------------------------------------------------|
| `atom`             | A utility for creating isolated states outside a component       |
| `usePortal`          | Create a portal for accessing and updating states                |
| `usePortal.local`    | A hook to persist state in Local Storage                         |
| `usePortal.session`  | A hook to persist state in Session Storage                       |
| `usePortal.cookie`   | A hook to persist state in `document.cookie`                     |
| `createBuilder`      | Create a builder object for defining keys and values             |
| `cookieStorage`      | An object representing the Cookie Storage API                    |
| `debounceEffect`     | A utility for creating a debounced effect in React               |

## Usage

### Import the necessary functions and hooks

This library exports the following APIs to enhance state management and facilitate state manipulation

```typescript
import {
  atom,
  createBuilder,
  cookieStorage,
  usePortal,
  debounceEffect
} from "@ibnlanre/portal";
```

### To create a `portal` for managing state, use the `usePortal` function

Here is an example:

```typescript
// Setting an initial state is optional.
const [name, setName] = usePortal("client", {
  state: {
    name: "John Doe",
    age: 54,
  }
})
```

The state can also be retrieved from a browser store. A good practice is to define the `get` function before the `set` function, because of type inference.

```typescript
const [token, setToken] = usePortal("token", {
  // Fallback initial state
  state: "",

  // Get initial state from a persistent storage.
  get: (state) => {
    const value = cookieStorage.getItem("token");
    if (value) return JSON.parse(value) as string
    return state;
  },

  // The set method is called when the state changes.
  // As well as, upon instantiation.
  set: (value) => {
    const state = JSON.stringify(value);
    cookieStorage.setItem("token", state);
  },
});
```

### To create a typed `portal` with a defined store, you can use the `usePortal.make` function

This allows you to manage and access the store value outside of a React component. Here's an example of how to use `usePortal.make`:

```typescript
// Create a store for type safety
const store = {
  foo: {
    bar: {
      baz: "qux"
    },
    rim: "raf"
  },
};

// Create the portal outside the React Component,
// so that it can be exported and used elsewhere.
export const useStorePortal = usePortal.make(store);

// Manage and access the store value
const [state, setState] = useStorePortal("foo");
```

### Persist the state by utilizing browser storage mechanisms

To persist the state in `localStorage`:

```typescript
const [state, setState] = useStorePortal.local("foo.bar");
```

To persist the state in `sessionStorage`:

```typescript
const [state, setState] = useStorePortal.session("foo.bar.baz");
```

To persist the state in `document.cookie`:

```typescript
const [state, setState] = useStorePortal.cookie("foo.rim", {
 path: "/"
});
```

### To manage state outside of a React Component, create an `atom`

An atom is a standalone state container that can be accessed and modified from anywhere in your application. Here's an example of creating an atom:

```typescript
// Atoms should be created outside React Components
const counterAtom = atom({ state: 9 });
```

To access the value of an atom within a component, you can use the following code:

```typescript
// An atom state is isolated from the portal system and can be accessed
// by explicitly exporting and importing the atom from where it was declared.
const [counter, setCounter] = counterAtom.use();
```

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
