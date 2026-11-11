import type { Channel } from "@/create-store/types/channel";

/**
 * Makes the `BroadcastChannel` side of an adapter: one channel object, opened
 * on first use and shared by `post` and `watch`. A channel never delivers to
 * the object that posted, so there is no echo. It closes when the last watcher
 * stops and reopens for a later one. Where there is no `BroadcastChannel`, `post`
 * and `watch` do nothing.
 *
 * @param name The channel name, shared by every tab that should follow.
 * @returns The `post` and `watch` pair.
 */
export function channel(name: string): Channel {
  let open: BroadcastChannel | undefined;
  let watching = 0;

  function connect() {
    if (typeof BroadcastChannel === "undefined") return undefined;
    return (open ??= new BroadcastChannel(name));
  }

  return {
    post(change) {
      try {
        const shared = connect();
        shared?.postMessage(change);
        // Posting alone must not leave a channel open.
        if (shared && watching === 0) {
          shared.close();
          open = undefined;
        }
      } catch (error) {
        console.error("Error occurred while announcing a change:", error);
      }
    },
    watch(listener) {
      const shared = connect();
      if (!shared) return () => {};
      const hear = (event: MessageEvent) =>
        listener({ removed: Boolean(event.data?.removed) });
      shared.addEventListener("message", hear);
      watching++;
      let stopped = false;
      return () => {
        if (stopped) return;
        stopped = true;
        shared.removeEventListener("message", hear);
        if (--watching === 0) {
          shared.close();
          open = undefined;
        }
      };
    },
  };
}
