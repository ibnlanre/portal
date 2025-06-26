import type { Todo } from "../../../store-examples";

import React from "react";

import { todoStore } from "./store";

const TodoExample: React.FC = () => {
  const [todos] = todoStore.todos.$use();
  const [newTodoText] = todoStore.newTodoText.$use();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") todoStore.addTodo();
    if (e.key === "Escape") todoStore.clearNewTodoText();
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-blue-500" />
  //     </div>
  //   );
  // }

  const completedTodos = todos.filter((todo: Todo) => todo.completed);
  const activeTodos = todos.filter((todo: Todo) => !todo.completed);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Todo Example</h1>
        <p className="text-lg text-gray-600">
          A todo list that persists to IndexedDB with real-time updates
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="flex space-x-2 mb-6">
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-blue-500 focus:border-transparent"
            placeholder="Add a new todo..."
            onChange={(e) => todoStore.setNewTodoText(e.target.value)}
            onKeyDown={handleKeyPress}
            type="text"
            value={newTodoText}
          />
          <button
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newTodoText.trim()}
            type="button"
            onClick={todoStore.addTodo}
          >
            Add
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {activeTodos.length} active, {completedTodos.length} completed
            </span>
            {completedTodos.length > 0 && (
              <button
                onClick={() => todoStore.clearCompleted()}
                className="text-red-600 hover:text-red-800"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-2">
            {todos.map((todo: Todo) => (
              <div
                key={todo.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  todo.completed
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => todoStore.toggleTodo(todo.id)}
                  className="w-4 h-4 text-portal-blue-600 border-gray-300 rounded focus:ring-portal-blue-500"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => todoStore.removeTodo(todo.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No todos yet. Add one above to get started!
            </div>
          )}
        </div>
      </div>

      <div className="card bg-green-50 border-green-200 max-w-2xl mx-auto">
        <h3 className="font-semibold text-green-900 mb-2">Features:</h3>
        <ul className="text-green-800 space-y-1 text-sm">
          <li>• Todos persist across browser sessions</li>
          <li>• Real-time updates across multiple tabs</li>
          <li>• Add, toggle, and remove todos with instant feedback</li>
          <li>• Clear completed todos with one click</li>
          <li>• Automatic IndexedDB synchronization</li>
        </ul>
      </div>
    </div>
  );
};

export default TodoExample;
