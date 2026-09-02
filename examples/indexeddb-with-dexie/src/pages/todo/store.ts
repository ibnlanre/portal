import { z } from "zod";

import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export const todoSchema = z.object({
  completed: z.boolean(),
  id: z.string(),
  text: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;

const [getStoredTodos, setStoredTodos] =
  createIndexedDBAdapter<Todo[]>("todos");

// Load initial state from IndexedDB
const initialTodos = await getStoredTodos([]);

export const todoStore = {
  todos: createStore(initialTodos),
  newTodoText: createStore(""),

  addTodo() {
    const newTodo: Todo = {
      completed: false,
      id: crypto.randomUUID(),
      text: todoStore.newTodoText.$get(),
    };

    todoStore.todos.$set((prev) => [...prev, newTodo]);
    todoStore.newTodoText.$set("");
  },

  clearCompleted() {
    todoStore.todos.$set((prev) => prev.filter((todo) => !todo.completed));
  },

  clearNewTodoText() {
    todoStore.newTodoText.$set("");
  },

  removeTodo(id: string) {
    todoStore.todos.$set((prev) => prev.filter((todo) => todo.id !== id));
  },

  setNewTodoText(text: string) {
    todoStore.newTodoText.$set(text);
  },

  toggleTodo(id: string) {
    todoStore.todos.$set((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  },
};

// Subscribe to store changes and auto-persist
todoStore.todos.$subscribe(setStoredTodos);
