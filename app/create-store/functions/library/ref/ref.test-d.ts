import { composite } from "@/create-store/functions/library/composite";

import { ref } from "./index";

type Check<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

class Queue {
  items: string[] = [];
  push(item: string) {
    this.items.push(item);
  }
}

// A ref is typed exactly as given: no readonly rewriting, no widening.
const queue = ref(new Queue());
export const held = queue.$get();
export type heldIsQueue = Check<Equal<typeof held, Queue>>;
held.items.push("mutable stays mutable");

const promise = ref(Promise.resolve(1));
export const heldPromise = promise.$get();
export type heldIsPromise = Check<Equal<typeof heldPromise, Promise<number>>>;

queue.$set(new Queue());
// @ts-expect-error a ref holds its own type
queue.$set("not a queue");

// In a composite it is a member, but never part of the state or of a write.
const app = composite({ count: 0, queue });
export const member = app.queue.$get();
export type memberIsQueue = Check<Equal<typeof member, Queue>>;

export const state = app.$get();
export type stateOmitsRef = Check<Equal<typeof state, { count: number }>>;
// @ts-expect-error the snapshot has no `queue`
state.queue;

app.$set({ count: 1 });
// @ts-expect-error a ref is not part of a composite write
app.$set({ queue: new Queue() });

// A ref is not a reactive store: there is nothing to subscribe to.
// @ts-expect-error
queue.$subscribe;
// @ts-expect-error
queue.$use;
