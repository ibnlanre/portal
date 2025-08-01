import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export interface Todo {
  completed: boolean;
  id: string;
  text: string;
}

const [getStoredTodos, setStoredTodos] =
  createIndexedDBAdapter<Todo[]>("todos");

// Load initial state from IndexedDB
const initialTodos = await getStoredTodos([]);

// Create the store with initial state
export const todoStore = createStore({
  addTodo: () => {
    const newTodo: Todo = {
      completed: false,
      id: crypto.randomUUID(),
      text: todoStore.newTodoText.$get(),
    };

    const currentTodos = todoStore.todos.$get();
    const updatedTodos = [...currentTodos, newTodo];

    todoStore.todos.$set(updatedTodos);
  },
  clearCompleted: () => {
    const currentTodos = todoStore.todos.$get();
    const updatedTodos = currentTodos.filter((todo) => !todo.completed);

    todoStore.todos.$set(updatedTodos);
  },
  clearNewTodoText: () => {
    todoStore.newTodoText.$set("");
  },
  newTodoText: "",
  removeTodo: (id: string) => {
    const currentTodos = todoStore.todos.$get();
    const updatedTodos = currentTodos.filter((todo) => todo.id !== id);

    todoStore.todos.$set(updatedTodos);
  },
  setNewTodoText: (text: string) => {
    todoStore.newTodoText.$set(text);
  },
  todos: initialTodos,
  toggleTodo: (id: string) => {
    const currentTodos = todoStore.todos.$get();
    const updatedTodos = currentTodos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    todoStore.todos.$set(updatedTodos);
  },
});

// Subscribe to store changes and auto-persist
todoStore.todos.$act(setStoredTodos);
