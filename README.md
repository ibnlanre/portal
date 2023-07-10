# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes), `@ibnlanre/portal` is a simple React state management library based on RxJS Behavior Subject. It provides a convenient way to manage state using React context. This library exports the following component and hooks:

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

<table>
    <thead>
        <tr>
            <th colspan="7"></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="">
                <code>Atom</code>
            </td>
            <td colspan="6">A <strong>class</strong> that facilitates creating states outside the React context.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>PortalProvider</code>
            </td>
            <td colspan="5">A provider <strong>component</strong> that wraps your application and manages the state.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>usePortal</code>
            </td>
            <td colspan="5">A <strong>hook</strong> that allows you to create, access and update the state.</td>
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
            <td colspan="4">A <strong>function</strong> to instantiate a cookie value store.</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <code>.cache</code>
            </td>
            <td colspan="3">A <strong>hook</strong> to store state in Browser Cookie store.</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <code>.options</code>
            </td>
            <td colspan="3">A <strong>function</strong> to update the cookie options.</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <code>.getCookie</code>
            </td>
            <td colspan="5">A <strong>function</strong> to retrieve a stored cookie value.</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <code>.atom</code>
            </td>
            <td colspan="5">A <strong>hook</strong> to access the state of an Atom.</td>
        </tr>
        <tr>
            <td colspan="2">
                <code>createBuilder</code>
            </td>
            <td colspan="5">Create a <strong>builder</strong> object for defining keys and values in a type-safe manner.</td>
        </tr>
    </tbody>
</table>

## Usage

1.  Import the necessary components and hooks:

    ```js
    import {
      usePortal,
      PortalProvider,
      Atom,
      createBuilder,
    } from "@ibnlanre/portal";
    ```

2.  Wrap your application with the `PortalProvider` component.

    - This should be used within the root `Component`:

      ```jsx
      // builder is optional, and is undefined by default.
      <PortalProvider builder={builder}>
        {/* Your application components */}
      </PortalProvider>
      ```

3.  Provide a marker for the state by passing a `key` to the `usePortal` hook.

    - To create an application `state`:

      ```js
      // The key can be any value
      const [state, setState] = usePortal("counter", 0);
      ```

    - To include a `reducer` for quick state updates:

      ```js
      // Create the reducer function:
      const reducer = (state, action) => {
        switch (action.type) {
          case "increment":
            return { ...state, count: state.count + 1 };
          case "reset":
            return { ...state, count: 0 };
          default:
            return state;
        }
      };
      ```

    - Include the reducer as the third argument:

      ```js
      const [state, dispatch] = usePortal(
        "counter.reducer",
        { count: 4 },
        reducer
      );

      const handleDecrement = () => dispatch({ type: "decrement" });
      const handleReset = () => dispatch({ type: "reset" });
      ```

4.  Persist the state by utilizing browser storage mechanisms.

    - To persist the state in `localStorage`:

      ```js
      // A array is used as the key, but could be anything
      const [state, setState] = usePortal.local(["counter", "local"], 1);

      // Accessing the identifier later, doesn't require the use of [local]
      const [counter, setCounter] = usePortal(["counter", "local"]);
      ```

    - To persist the state in `sessionStorage`:

      ```js
      // An object is used as the key, but could be anything
      const [state, setState] = usePortal.session({ counter: "session" }, 2);

      // Accessing the identifier later, doesn't require the use of [session]
      const [counter, setCounter] = usePortal({ counter: "session" });
      ```

    - To persist the state in `cookieStore`:

      ```js
      // Assign placeholder cookie options:
      const counterCookie = usePortal.cookie({
        path: "/",
        expires: 30 * 1000, // milliseconds
        maxAge: 30, // seconds
        secure: true,
      }); // use this API outside of a Component

      // Instantiate cookie state within a React Component
      const [cookieState, setCookieState] = counterCookie.cache(
        "cookie.counter",
        3
      );

      // Update previously set cookie options
      counterCookie.options({ sameSite: "lax" });
      ```

    - Access the previously created cookie:

      ```js
      // Retrieve cookie value outside of a Component
      const cookie = usePortal.getCookie("cookie.counter");

      // Manage cookie state through the Portal system
      const [cookieState, setCookieState] = usePortal("cookie.counter");
      ```

     </details>

5.  To access a `Portal` outside of a component, create an `Atom`.

    - Create the `atom` with a key, value, and optional reducer:

      ```js
      const counterAtom = new Atom(["counter", "atom"], 5);
      ```

    - To access the value from the atom:

      ```js
      const [state, setState] = usePortal.atom(counterAtom);

      // Doing so in a parent componenet, would make this value
      // available within the portal system, and accessible by
      // children components through the Portal Provider
      ```

    - Subsequently, you can access the stored value by its key:

      ```js
      const [state, setState] = usePortal(["counter", "atom"]);
      ```

6.  To `access` the internals of the `portal` system.

    - Call `usePortal` without any arguments:

      ```js
      const { builder, entries, remove, clear } = usePortal();
      ```

    - Remove items from the portal system:

      ```js
      // Remove the item both in the application state,
      // as well as, in the browser storage state.
      remove("counter");

      // Remove the item from both local and session storage only.
      remove("counter", ["local", "session"]);

      // Remove the item from cookie storage only.
      remove("counter", ["cookie"]);

      // Remove the item from application state only.
      remove("counter", []);
      ```

    - Clear the entire `portal` system:

      ```js
      clear();
      ```

7.  To create a `builder` pattern for property access.

    - Make of nested record of a `key` and `value` pair:

      ```js
      const value = {
        foo: {
          baz: (id: number) => `/bazaar/${id}`,
          bar: 1,
        },
      };

      const builder = createBuilder(value);
      ```

    - Access the `keys`:

      ```js
      builder.foo.use(); // ["foo"]
      builder.foo.baz.use(7); // ["foo", "baz", 7]
      ```

    - Get nested `values`:

      ```js
      builder.use(); // value
      builder.use().foo.bar; // 1
      builder.use().foo.baz(4); // "/bazaar/4"
      ```

8.  Efficiently create `states` using the `builder` pattern:

    ```js
    // Destructure builder from usePortal.
    const { builder } = usePortal();

    // Use the builder to generate required arguments
    const [barzaar, setBarzaar] = usePortal(
      builder.foo.bar.use(), // ["foo", "bar"]
      builder.use().foo.bar // 1
    );
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
