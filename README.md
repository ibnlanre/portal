# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes), `@ibnlanre/portal` is a simple React state management library based on RxJS Behavior Subject. It provides a convenient way to manage state using React context. This library exports the following component and hooks:

- `PortalProvider`: A provider component that wraps your application and manages the state.
- `usePortal`: A hook that allows you to create, access and update the state.
    - `.local`: to persist state in Local Storage.
    - `.session`: to persist state in Session Storage.
    - `.cookie`: to store state in Document Cookie.
    - `.delete`: to remove value from the Cache.

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
    import { PortalProvider, usePortal } from "@ibnlanre/portal";
    ```

2. Wrap your application with the `PortalProvider` component:

    ```js
    function App() {
        return (
            <PortalProvider>
                {/* Your application components */}
            </PortalProvider>
        );
    }
    ```

3. Create a marker for the state by passing a `key` to the `usePortal` hook.
    
    ```js
    import { usePortal } from "@ibnlanre/portal";

    const initialState = { 
        count: 0,
    };
    ```

    - Optionally, pass in an `initial value` for your state.

        ```js
        function Counter() {
            const [state, setState] = usePortal("counter", initialState);

            // persist state in Local Storage
            const [localState, setLocalState] = usePortal.local("local.counter", initialState);

            // persist state in Session Storage
            const [sessionState, setSessionState] = usePortal.session("session.counter", initialState);

            // persist data in Cookie Storage
            const [cookieState, setCookieState] = usePortal({
                path: '/',
                expires: 30,
                secure: true
            }).cache("cookie.counter", initialState)
                
            const handleIncrement = () => { 
                setState((prev) => ({ count: prev + 1 }));
            };
            const handleDecrement = () => { 
                setState((prev) => ({ count: prev - 1 }));
            };
            const handleReset = () => { setState(initialState) };

            return (
                <div>
                    <p>Count: {state.count}</p>
                    <button onClick={handleIncrement}>Increment</button>
                    <button onClick={handleDecrement}>Decrement</button>
                    <button onClick={handleReset}>Reset</button>
                </div>
            );
        }
        ```

    - Additionally, you can include a `reducer` for quick state updates.

        ```js
        const reducer = (state, action) => {
            switch (action.type) {
                case "increment":
                    return { ...state, count: state.count + 1 };
                case "decrement":
                    return { ...state, count: state.count - 1 };
                case "reset":
                    return { ...state, count: 0 };
                default:
                    return state;
            }
        };

        function ReducerCounter() {
            const [state, dispatch] = usePortal("counter.reducer", initialState, reducer);

            const handleIncrement = () => dispatch({ type: "increment" });
            const handleDecrement = () => dispatch({ type: "decrement" });
            const handleReset = () => dispatch({ type: "reset" });

            return (
                <div>
                    <p>Count: {state.count}</p>
                    <button onClick={handleIncrement}>Increment</button>
                    <button onClick={handleDecrement}>Decrement</button>
                    <button onClick={handleReset}>Reset</button>
                </div>
            );
        }
        ```

4. Use the `usePortal` hook to access states created within other components:

    ```js
    function MyComponent() {
        const [store, dispatch] = usePortal("counter.reducer");
        const [state, setState] = usePortal("counter");

        // delete stored value within portal system
        usePortal.delete("counter");
    }
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