import { vi } from "vitest";

/**
 * A stand-in for `BroadcastChannel` for tests: it delivers to every other open
 * channel with the same name and never to the one that posted, and it counts
 * the channels left open and ever created.
 */
export function fakeBroadcastChannel() {
  const open = new Set<Fake>();
  const state = { created: 0, failPost: false };

  class Fake {
    closed = false;
    listeners = new Set<(event: { data: unknown }) => void>();
    constructor(public name: string) {
      open.add(this);
      state.created++;
    }
    addEventListener(
      _type: string,
      listener: (event: { data: unknown }) => void
    ) {
      this.listeners.add(listener);
    }
    close() {
      this.closed = true;
      open.delete(this);
    }
    postMessage(data: unknown) {
      if (this.closed) throw new Error("channel is closed");
      if (state.failPost) throw new Error("post failed");
      for (const other of open) {
        if (other === this || other.name !== this.name) continue;
        for (const listener of other.listeners) listener({ data });
      }
    }
    removeEventListener(
      _type: string,
      listener: (event: { data: unknown }) => void
    ) {
      this.listeners.delete(listener);
    }
  }

  vi.stubGlobal("BroadcastChannel", Fake);
  return {
    /** How many channels were ever constructed. */
    get created() {
      return state.created;
    },
    get failPost() {
      return state.failPost;
    },
    set failPost(value: boolean) {
      state.failPost = value;
    },
    open,
  };
}
