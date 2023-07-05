# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes), `@ibnlanre/portal` is a simple React state management library based on RxJS Behavior Subject. It provides a convenient way to manage state using React context. This library exports the following component and hooks:

- `Atom`: a class that facilitates the creation and sharing of states among components.
- `PortalProvider`: A provider component that wraps your application and manages the state.
- `usePortal`: A hook that allows you to create, access and update the state.
    - `.local`: to persist state in Local Storage.
    - `.session`: to persist state in Session Storage.
    - `.cookie`: to store state in Document Cookie.
    - `.atom`: to access the state of an Atom.

## Installation

To install `@ibnlanre/portal`, you can use npm or yarn. Run the following command in your project directory:

```shell
npm install @ibnlanre/portal
```

or 

```shell
yarn add @ibnlanre/portal
```

## Usage

1. Import the necessary components and hooks:

    ```js
    import { usePortal, PortalProvider, Atom } from "@ibnlanre/portal";
    ```

2. Wrap your application with the `PortalProvider` component:

    ```js
    // This should be used within a React Component
    <PortalProvider>
        {/* Your application components */}
    </PortalProvider>
    ```

3. Create a marker for the state by passing a `key` to the `usePortal` hook.
    
    - Optionally, pass in an `initial value` for your state.

    ```js
    // The key can be any value
    const [state, setState] = usePortal("counter", 0);
    ```

    - To persist the state in `localStorage`:

    ```js
    // A array is used as the key, but could be anything
    const [state, setState] = usePortal.local(["counter", "local"], 1);
    ```

    - To persist the state in `sessionStorage`:

    ```js
    // An object is used as the key, but could be anything
    const [state, setState] = usePortal.session({ counter: "session" }, 2);
    ```

    - To cache the state in `document.cookie`:

    ```js
    const cookies = = usePortal({
        path: '/',
        expires: 30 * 1000, // milliseconds
        secure: true
    });

    const [cookieState, setCookieState]  = cookies.cache("cookie.counter", 3);
    cookies.options({ sameSite: "lax" });
    ```

    - You can as well include a `reducer` for quick state updates.

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
    
    const initialState = { count: 4 }
    const [state, dispatch] = usePortal("counter.reducer", initialState, reducer);
    
    const handleDecrement = () => dispatch({ type: "decrement" });
    const handleReset = () => dispatch({ type: "reset" });
    ```

4. Use the `usePortal` hook to access states created within other components:

    ```js
    const [store, dispatch] = usePortal("counter.reducer");
    const [state, setState] = usePortal("counter");
    ```

5. To access a `Portal` outside of a component, create an `Atom`.

    - Create the `atom` with a key, value, and optional reducer:

    ```js
    const counterAtom = new Atom(["counter", "atom"], 5)
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

6. To `remove` an item from the `portal` system

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

## API

### `PortalProvider`
A provider component that wraps your application and manages the state.

#### Props
- None

### `usePortal`
A hook that allows you to access the state and dispatch actions.

#### Returns
- A tuple containing the state and dispatch function.

## Author

Ridwan Olanrewaju, [root.i.ng](https://www.root.i.ng), [@ibnlanre](https://linkedin.com/in/ibnlanre)

## Contributions

All contributions are welcome and appreciated. Thanks for taking the time to contribute to `@ibnlanre/portal`!

## Release

```shell
git add .
yarn package
```

## License

This library is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```txt
Feel free to customize the content according to your needs. But, do leave a shoutout. Thanks 😊.
```