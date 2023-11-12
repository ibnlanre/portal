# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes) and [Tanstack Query](https://tanstack.com/query), `@ibnlanre/portal` is a simple **application** state management library for managing component state on a global level.

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

This library exports the following APIs to enhance state management and facilitate state manipulation:

<table>
    <tbody>
        <tr>
            <td colspan="">
                <code>atom</code>
            </td>
            <td colspan="6">A <strong>utility</strong> for creating isolated states outside a component.</td>
        </tr>
        <tr>
            <td colspan="">
                <code>useAtom</code>
            </td>
            <td colspan="6">A <strong>hook</strong> to access and manage the state of an Atom.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>makeUsePortal</code>
            </td>
            <td colspan="5">Create a <strong>portal</strong> for accessing and updating states.</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <code>.local</code>
            </td>
            <td colspan="4">A <strong>hook</strong> to persist state in Local Storage.</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <code>.session</code>
            </td>
            <td colspan="4">A <strong>hook</strong> to persist state in Session Storage.</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <code>.cookie</code>
            </td>
            <td colspan="4">A <strong>hook</strong> to persist state in `document.cookie`.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>createBuilder</code>
            </td>
            <td colspan="5">Create a <strong>builder</strong> object for defining keys and values in a type-safe manner.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>cookieStorage</code>
            </td>
            <td colspan="5">An <strong>object</strong> representing the Cookie Storage API with methods for getting and setting cookies.</td>
        </tr>
    </tbody>
</table>

## Usage

1. **Import the necessary components and hooks.**

    ```js
    import {
      atom,
      useAtom,
      createBuilder,
      cookieStorage,
      makeUsePortal,
    } from "@ibnlanre/portal";
    ```

2. **To create an application `state`, provide a marker for the state by passing a `store` to the `makeUsePortal` function and a `path` to the `usePortal` hook.**

    ```js
    // Create a store for type safety
    const store = {
      foo: {} as {
        bar: {
          baz: "qux"
        }
      } & {
        rim: "raf"
      },
    };

    // Create a portal using the store
    const usePortal = makeUsePortal(store);

    // Manage and access the store value
    const [state, setState] = usePortal("foo");
    ```

3. **Persist the state by utilizing browser storage mechanisms.**

    ```js
    // To persist the state in `localStorage`:
    const [state, setState] = usePortal.local("foo.bar");

    // To persist the state in `sessionStorage`:
    const [state, setState] = usePortal.session("foo.bar.baz");

    // To persist the state in `document.cookie`
    const [state, setState] = usePortal.cookie("foo.rim", { 
      path: "/"
    });
    ```

4. **To manage state outside of a React Component, create an `atom`.**

    - Create the `atom` with a key, value, and optional reducer:

      ```js
      // Atoms should be created outside React Components
      const counterAtom = atom({ state: 9 });
      ```

    - To access the atom value within a component:

      ```js
      // An atom state is isolated from the portal system and can be accessed
      // by explicitly exporting and importing the atom from where it was declared.
      const [counter, setCounter] = useAtom({ store: counterAtom });
      ```

    - An advanced example would be:

      ```js
      const messagesAtom = atom({
        state: {} as Messages,
        events: {
          get: ({ value }) => value?.messages?.at(0)?.last_24_hr_data,
          set: ({ value }) => decrypt(value),
        },
      });

      // Don't manually add the type as a Generic.
      export const userAtom = atom({
        state: {} as UserData,
        events: {
          set: ({ current }) => decrypt(current),
          use: ({ set, props: { getUrl } }, user: string) => {
            const ws = new WebSocket(getUrl(user));
            ws.onmessage = ((value) => {
              set(JSON.parse(value.data))
            });

            return () => {
              if (ws.readyState === WebSocket.OPEN) ws.close();
            }
          },
        },
        properties: {
          getUrl: (user: string) => {
            return builders.use().socket.users(user);
          }
        },
      });

      const [messages, setMessages] = useAtom({ store: messagesAtom });
      const [users, setUsers] = useAtom({ store: userAtom, useArgs: [messages.user] });
      ```

5. **To create a `builder` pattern for property access.**

    - Make of nested record of a `key` and `value` pair:

      ```js
      const store = {
        foo: {
          baz: (id: number) => `/bazaar/${id}`,
          bar: 10,
        },
      };

      const builder = createBuilder(store);
      ```

    - Access the `keys`:

      ```js
      // `use` expects that the required arguments are passed.
      builder.foo.baz.use(11); // ["foo", "baz", 11]

      // `get` retrieves the keys without invoking the function.
      builder.foo.baz.get(); // ["foo", "baz"]

      // `get` also allows you to add more keys
      builder.foo.baz.get("test"); // ["foo", "baz", "test"]
      ```

    - Get nested `values`:

      ```js
      builder.use(); // store
      builder.use().foo.baz(12); // "/bazaar/12"
      builder.use().foo.bar; // 10
      ```

    - Add a prefix to the keys:

      ```js
      const builderWithPrefix = createBuilder(store, "tap", "root");
      builderWithPrefix.foo.bar.use() // ["tap", "root", "foo", "bar"]
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
