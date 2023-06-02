# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes), `@ibnlanre/portal` is a simple React state management library based on RxJS Behavior Subject. It provides a convenient way to manage state using React context. This library exports the following component and hooks:

- `PortalProvider`: A provider component that wraps your application and manages the state.
- `usePortal`: A hook that allows you to create, access and update the state.

## Installation
---

To install `@ibnlanre/portal`, you can use npm or yarn. Run the following command in your project directory:

```shell
npm install @ibnlanre/portal
```

or 

```shell
yarn add @ibnlanre/portal
```

## Usage
---

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

3. Create state with the `usePortal` hook within your components

```js
import { usePortal } from "@ibnlanre/portal";

const initialState = {
    count: 0,
};

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
```

- Component without a reducer function

    ```js
    function Counter() {
        const [state, setState] = usePortal("counter", initialState);
            
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

- Component with a reducer function

    ```js
    function ReducerCounter() {
        const [state, dispatch] = usePortal("counter.reducer", initialState, reducer);

        const handleIncrement = () => { dispatch({ type: "increment" }) };
        const handleDecrement = () => { dispatch({ type: "decrement" }) };
        const handleReset = () => { dispatch({ type: "reset" }) };

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

4. Use the `usePortal` hook to access the state with another component:

```js
function MyComponent() {
    const [store, dispatch] = usePortal("counter.reducer");
    const [state, setState] = usePortal("counter");

    // Your component logic
}
```

## API
---

### `PortalProvider`
A provider component that wraps your application and manages the state.

#### Props
- None

### `usePortal`
A hook that allows you to access the state and dispatch actions.

#### Returns
- A tuple containing the state and dispatch function.

## Author
---

Ridwan Olanrewaju, [root.i.ng](https://www.root.i.ng), [@ibnlanre](https://linkedin.com/in/ibnlanre)

## Contributions
---

All contributions are welcome and appreciated. Thanks for taking the time to contribute to `@ibnlanre/portal`!

## Releasing
---

```shell
yarn version --new-version <major|minor|patch>
yarn publish --access public
git push origin master --tags
```

## License
---

This library is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```txt
Feel free to customize the content and formatting according to your needs.
```