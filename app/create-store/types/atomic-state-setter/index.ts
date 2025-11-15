import type { Dispatch, SetStateAction } from "react";

import type { DeepPartial } from "@/create-store/types/deep-partial";

/**
 * A setter function that performs complete state replacement.
 * Unlike partial setters, this replaces the entire state value.
 */
export type AtomicStateSetter<State> = Dispatch<
  SetStateAction<DeepPartial<State>>
>;
