import Layout from "./components/Layout";
import TodoExample from "./pages/todo";
import UserProfileExample from "./pages/user-profile";

import { Route, Routes } from "react-router-dom";

import { Counter } from "./pages/counter";
import { Home } from "./pages/home";
import { Preferences } from "./pages/preferences";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Counter />} path="/counter" />
        <Route element={<TodoExample />} path="/todos" />
        <Route element={<UserProfileExample />} path="/profile" />
        <Route element={<Preferences />} path="/preferences" />
      </Routes>
    </Layout>
  );
}
