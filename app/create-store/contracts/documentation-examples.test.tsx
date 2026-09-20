import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { createContextStore } from "@/create-store/functions/library/create-context-store";

import { createStore } from "../index";

describe("documentation examples", () => {
  it("keeps state with the durable factory from the scoped stores guide", () => {
    const [CounterProvider, useCounterStore] = createContextStore(
      (props: { start: number }) => {
        const [store] = useState(() => createStore(props.start));
        return store;
      }
    );

    function Counter() {
      const store = useCounterStore();
      const [count, setCount] = store.$use();
      return (
        <button data-testid="count" onClick={() => setCount(count + 1)}>
          {count}
        </button>
      );
    }

    const view = render(
      <CounterProvider value={{ start: 10 }}>
        <Counter />
      </CounterProvider>
    );
    fireEvent.click(screen.getByTestId("count"));
    expect(screen.getByTestId("count")).toHaveTextContent("11");

    view.rerender(
      <CounterProvider value={{ start: 10 }}>
        <Counter />
      </CounterProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("11");
  });

  it("writes the addressed store for selector and branch setters", () => {
    const store = createStore({ count: 1, label: "a" });

    const selected = renderHook(() => store.$use((state) => state.count));
    act(() => selected.result.current[1]({ count: 7 }));
    expect(store.$get().count).toBe(7);
    expect(selected.result.current[0]).toBe(7);

    const branch = renderHook(() => store.count.$use());
    act(() => branch.result.current[1](9));
    expect(store.$get()).toEqual({ count: 9, label: "a" });
    expect(branch.result.current[0]).toBe(9);
  });

  it("matches the escaped-path example from the reading guide", () => {
    const store = createStore({ a: { b: 2 }, "a.b": 1 });

    expect(store.a.b.$get()).toBe(2);
    expect(store.$at("a.b").$get()).toBe(2);
    expect(store.$at("a\\.b").$get()).toBe(1);
    expect(store["a.b"].$get()).toBe(1);
  });
});
