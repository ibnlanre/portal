import { Route, Routes } from "react-router-dom";

import { Counter } from "./pages/counter";
import { Home } from "./pages/home";
import { Preferences } from "./pages/preferences";
import { TodoList } from "./pages/todo";
import { UserProfile } from "./pages/user-profile";

import Layout from "./components/layout";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Counter />} path="/counter" />
        <Route element={<TodoList />} path="/todos" />
        <Route element={<UserProfile />} path="/profile" />
        <Route element={<Preferences />} path="/preferences" />
      </Routes>
    </Layout>
  );
}
