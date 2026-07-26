import type { DependencyList } from "react";

import type { AsyncFunction } from "@/create-store/types/async-function";

import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useAsync } from "@/create-store/functions/hooks/use-async";
import { setup } from "@/vitest.react";

type AsyncTestComponentProps = {
  dependencies?: DependencyList;
  effect: AsyncFunction;
};

function AsyncTestComponent({ dependencies, effect }: AsyncTestComponentProps) {
  const { data, error, isLoading } = useAsync(effect, dependencies);

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (data) return <div data-testid="data">{JSON.stringify(data)}</div>;

  return <div data-testid="no-data">No data</div>;
}

describe("useAsync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should show loading then data on success", async () => {
    const effect: AsyncFunction<{ value: string }> = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { value: "success" };
    };

    render(<AsyncTestComponent effect={effect} />);
    vi.advanceTimersByTime(50);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ value: "success" })
      );
    });
  });

  it("should show error on failure", async () => {
    const effect: AsyncFunction<never> = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      throw new Error("fail");
    };

    render(<AsyncTestComponent effect={effect} />);
    vi.advanceTimersByTime(50);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Error: fail");
    });
  });

  it("should re-run when dependencies change", async () => {
    function Wrapper() {
      const [count, setCount] = useState(0);

      const effect: AsyncFunction<{ count: number }> = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { count };
      };

      return (
        <>
          <button
            data-testid="increment"
            onClick={() => setCount((c) => c + 1)}
            type="button"
          >
            Increment
          </button>
          <AsyncTestComponent dependencies={[count]} effect={effect} />
        </>
      );
    }

    const { user } = setup(<Wrapper />);
    vi.advanceTimersByTime(50);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ count: 0 })
      );
    });

    await user.click(screen.getByTestId("increment"));

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.advanceTimersByTime(50);
    vi.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ count: 1 })
      );
    });
  });

  it("should abort previous request when dependencies change quickly", async () => {
    let aborted = false;

    function Wrapper() {
      const [count, setCount] = useState(0);

      const effect: AsyncFunction<{ count: number }> = async ({ signal }) => {
        signal.addEventListener("abort", () => {
          aborted = true;
        });

        await new Promise((resolve) => setTimeout(resolve, 30));

        return { count };
      };

      return (
        <>
          <button
            data-testid="increment"
            onClick={() => setCount((c) => c + 1)}
            type="button"
          >
            Increment
          </button>

          <AsyncTestComponent dependencies={[count]} effect={effect} />
        </>
      );
    }

    const { user } = setup(<Wrapper />);
    vi.advanceTimersByTime(30);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.runAllTimersAsync();

    await user.click(screen.getByTestId("increment"));

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ count: 1 })
      );
    });

    expect(aborted).toBe(true);
  });

  it("should handle signal cancellation properly", async () => {
    const effect: AsyncFunction<{ message: string }> = async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      if (signal.aborted) {
        throw new Error("Operation cancelled");
      }

      return { message: "completed" };
    };

    render(<AsyncTestComponent effect={effect} />);
    vi.advanceTimersByTime(10);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    vi.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ message: "completed" })
      );
    });
  });
});
