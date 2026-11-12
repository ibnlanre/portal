import type { Channel } from "@/create-store/types/channel";
import type { StorageChange } from "@/create-store/types/storage-change";

type Watcher = {
  key: string;
  listener: (change: StorageChange) => void;
  owner: object;
};

// One `BroadcastChannel` per origin carries every key; a message names its key
// and each watcher hears only its own. Opened by the first watcher, closed by
// the last, so a collection of thousands of entries holds one channel.
const name = "@ibnlanre/portal";
const watchers = new Set<Watcher>();
let open: BroadcastChannel | undefined;

/**
 * Makes the `BroadcastChannel` side of an adapter for one key. `post` tells
 * other tabs, and the other watchers of the same key in this tab, that the
 * stored value changed; `watch` hears them. A channel never delivers to the
 * object that posted, so there is no echo. The shared channel closes when the
 * last watcher stops. Where there is no `BroadcastChannel`, other tabs are not
 * told and not heard.
 *
 * @param key The storage key of the adapter.
 * @returns The `post` and `watch` pair.
 */
export function channel(key: string): Channel {
  const owner = {};

  return {
    post(change) {
      try {
        const bus = connect();
        bus?.postMessage({ key, removed: change.removed });
        for (const watcher of Array.from(watchers)) {
          if (watcher.key === key && watcher.owner !== owner) {
            watcher.listener({ removed: change.removed });
          }
        }
        // Posting alone must not leave a channel open.
        if (watchers.size === 0) close();
      } catch (error) {
        console.error("Error occurred while announcing a change:", error);
      }
    },
    watch(listener) {
      const watcher: Watcher = { key, listener, owner };
      watchers.add(watcher);
      connect();
      return () => {
        if (!watchers.delete(watcher)) return;
        if (watchers.size === 0) close();
      };
    },
  };
}

function close() {
  open?.close();
  open = undefined;
}

function connect() {
  if (typeof BroadcastChannel === "undefined") return undefined;
  if (open) return open;
  open = new BroadcastChannel(name);
  open.addEventListener("message", (event: MessageEvent) => {
    const { key, removed } = event.data ?? {};
    for (const watcher of Array.from(watchers)) {
      if (watcher.key === key) watcher.listener({ removed: Boolean(removed) });
    }
  });
  return open;
}
