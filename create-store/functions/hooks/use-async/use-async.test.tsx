import type { DependencyList } from "react";

import type { AsyncFunction } from "@/create-store/types/async-function";

import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

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
  it("should show loading then data on success", async () => {
    const effect: AsyncFunction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { value: "success" };
    };

    render(<AsyncTestComponent effect={effect} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ value: "success" })
      );
    });
  });

  it("should show error on failure", async () => {
    const effect: AsyncFunction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      throw new Error("fail");
    };

    render(<AsyncTestComponent effect={effect} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Error: fail");
    });
  });

  it("should re-run when dependencies change", async () => {
    function Wrapper() {
      const [count, setCount] = useState(0);

      const effect: AsyncFunction = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
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

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ count: 0 })
      );
    });

    await user.click(screen.getByTestId("increment"));

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

      const effect: AsyncFunction = async ({ signal }) => {
        await new Promise((resolve) => setTimeout(resolve, 30));

        if (signal.aborted) {
          aborted = true;
          throw new Error("aborted");
        }

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

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await user.click(screen.getByTestId("increment"));

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ count: 1 })
      );
    });

    expect(aborted).toBe(true);
  });

  it("should handle signal cancellation properly", async () => {
    const effect: AsyncFunction = async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      if (signal.aborted) {
        throw new Error("Operation cancelled");
      }

      return { message: "completed" };
    };

    render(<AsyncTestComponent effect={effect} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify({ message: "completed" })
      );
    });
  });
});
