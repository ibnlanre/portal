import type { Store } from "@/create-store/types/store";

/** One whole value. Reads return exactly the type you gave. */
export interface PrimitiveStore<Value> extends Store<Value, Value> {}
