# @ibnlanre/portal

A powerful and flexible TypeScript state management library for React applications, featuring built-in storage adapters and intuitive API.

## Table of Contents

- [Installation](#installation)
- [Core Features](#core-features)
- [Storage Integration](#storage-integration)
- [Advanced Features](#advanced-features)
- [License](#license)

## Installation

<details>
<summary>Package Managers</summary>

Choose your preferred package manager:

```bash
# Using npm
npm i @ibnlanre/portal

# Using yarn
yarn add @ibnlanre/portal

# Using pnpm
pnpm i @ibnlanre/portal
```

</details>

<details>
<summary>CDN Links</summary>

```html
<!-- Using unpkg -->
<script src="https://unpkg.com/@ibnlanre/portal"></script>

<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
```

</details>

## Core Features

<details>
<summary><strong>Store Creation</strong> - Different ways to initialize your store</summary>

```typescript
import { createStore } from "@ibnlanre/portal";

// Basic store creation
const primitiveStore = createStore("initial value");
const objectStore = createStore({ key: "value" });

// Nested object store
const complexStore = createStore({
  user: {
    profile: {
      name: "John Doe",
      settings: {
        theme: "dark",
        notifications: true,
      },
    },
  },
});

// Async store initialization
const asyncStore = await createStore(async () => {
  const response = await fetch("https://api.example.com/data");
  return response.json();
});
```

</details>

<details>
<summary><strong>State Operations</strong> - Accessing and modifying state</summary>

### Reading State

```typescript
// Get entire state
const fullState = store.$get();

// Get nested values
const theme = store.$get("user.profile.settings.theme");

// Multiple paths
const [theme, notifications] = store.$get([
  "user.profile.settings.theme",
  "user.profile.settings.notifications",
]);
```

### Updating State

```typescript
// Set entire state
store.$set()({ newState: "value" });

// Update nested value
store.$set("user.profile.settings.theme")("light");

// Update with previous value
store.$set("user.profile.settings.theme")((prev) =>
  prev === "dark" ? "light" : "dark"
);
```

</details>

<details>
<summary><strong>React Integration</strong> - Using portal in React components</summary>

```typescript
function ThemeToggler() {
  // Basic usage
  const [theme, setTheme] = store.$use("user.profile.settings.theme");

  // Multiple paths
  const [[theme, notifications], [setTheme, setNotifications]] = store.$use([
    "user.profile.settings.theme",
    "user.profile.settings.notifications",
  ]);

  // With transformation
  const [isDarkMode, setIsDarkMode] = store.$use(
    "user.profile.settings.theme",
    {
      get: (theme) => theme === "dark",
      set: (isDark) => (isDark ? "dark" : "light"),
    }
  );

  return (
    <button
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
    >
      Toggle Theme
    </button>
  );
}
```

</details>

## Storage Integration

<details>
<summary><strong>Built-in Storage Adapters</strong></summary>

### Local Storage

```typescript
import { createStore, createLocalStorageAdapter } from "@ibnlanre/portal";

const [getState, setState] = createLocalStorageAdapter("app-state");
const store = createStore(getState);
store.$sub(setState);
```

### Session Storage

```typescript
import { createStore, createSessionStorageAdapter } from "@ibnlanre/portal";

const [getState, setState] = createSessionStorageAdapter("session-state");
const store = createStore(getState);
store.$sub(setState);
```

### Cookie Storage

```typescript
import { createStore, createCookieStorageAdapter } from "@ibnlanre/portal";

const [getState, setState] = createCookieStorageAdapter("cookie-state", {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  secure: true,
  sameSite: "strict",
});
const store = createStore(getState);
store.$sub(setState);
```

</details>

<details>
<summary><strong>Custom Storage Integration</strong></summary>

```typescript
import { createStore, createCustomStorageAdapter } from "@ibnlanre/portal";

const customStorage = {
  getItem: (key) => // custom get logic,
  setItem: (key, value) => // custom set logic,
  removeItem: (key) => // custom remove logic
};

const [getState, setState] = createCustomStorageAdapter("custom-key", customStorage);
const store = createStore(getState);
store.$sub(setState);
```

</details>

## Advanced Features

<details>
<summary><strong>Store Subscriptions</strong></summary>

```typescript
// Basic subscription
store.$sub((newState) => {
  console.log("State updated:", newState);
});

// Path-specific subscription
store.$sub("user.profile.settings", (settings) => {
  console.log("Settings updated:", settings);
});

// Multiple paths subscription
store.$sub(
  ["user.profile.settings.theme", "user.profile.settings.notifications"],
  ([theme, notifications]) => {
    console.log("Theme or notifications updated:", { theme, notifications });
  }
);
```

</details>

<details>
<summary><strong>Type Safety</strong></summary>

```typescript
interface UserState {
  profile: {
    name: string;
    settings: {
      theme: "light" | "dark";
      notifications: boolean;
    };
  };
}

const store = createStore<UserState>({
  profile: {
    name: "John Doe",
    settings: {
      theme: "light",
      notifications: true,
    },
  },
});

// TypeScript will ensure type safety
const [theme] = store.$use("profile.settings.theme"); // type: "light" | "dark"
```

</details>

## License

MIT

// Create a store with an object
const store = createStore({ key: "value" });

// Create a store with a nested object
const store = createStore({
location: {
unit: "Apt 1",
address: {
street: "123 Main St",
city: "Springfield",
},
},
});
