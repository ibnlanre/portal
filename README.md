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
    </tbody>
</table>

## Usage

1. Import the necessary components and hooks:

   ```js
   import { usePortal, PortalProvider, Atom } from "@ibnlanre/portal";
   ```

2. Wrap your application with the `PortalProvider` component:

   ```jsx
   // This should be used within a React Component
   <PortalProvider>{/* Your application components */}</PortalProvider>
   ```

3. Provide a marker for the state by passing a `key` to the `usePortal` hook.

    <details>
    <summary>To create an application <code>state</code>:</summary>

   ```js
   // The key can be any value
   const [state, setState] = usePortal("counter", 0);
   ```

    </details>

    <details>
    <summary>To include a <code>reducer</code> for quick state updates:</summary>

   - Create the reducer function:

     ```js
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

    </details>

4. Persist the state by utilizing browser storage mechanisms.

    <details>
    <summary>To persist the state in <code>localStorage</code>:</summary>

   ```js
   // A array is used as the key, but could be anything
   const [state, setState] = usePortal.local(["counter", "local"], 1);
   ```

    </details>

    <details>
    <summary>To persist the state in <code>sessionStorage</code>:</summary>

   ```js
   // An object is used as the key, but could be anything
   const [state, setState] = usePortal.session({ counter: "session" }, 2);
   ```

    </details>

    <details>
    <summary>To persist the state in <code>cookieStore</code>:</summary>

   - Assign placeholder cookie options:

     ```js
     // Note: use this API outside of a React Component
     const counterCookie = usePortal.cookie({
       path: "/",
       expires: 30 * 1000, // milliseconds
       maxAge: 30, // seconds
       secure: true,
     });

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

5. Use the `usePortal` hook to access states created within other components:

   ```js
   const [store, dispatch] = usePortal("counter.reducer");
   const [state, setState] = usePortal("counter");
   ```

6. To access a `Portal` outside of a component, create an `Atom`.

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

7. To `remove` an item from the `portal` system

   ```js
   const { entries, remove, clear } = usePortal();

   // Remove the item both in the application state,
   // as well as, in the browser storage state.
   remove("counter");

   // Remove the item from both local and session storage only.
   remove("counter", ["local", "session"]);

   // Remove the item from cookie storage only.
   remove("counter", ["cookie"]);

   // Remove the item from application state only.
   remove("counter", []);

   // clear the portal system.
   clear();
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
