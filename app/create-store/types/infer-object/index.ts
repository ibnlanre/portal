import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { GenericObject } from "@/create-store/types/generic-object";
import type { InferSchema } from "@/create-store/types/infer-schema";

/**
 * Infers the output type of a Standard Schema, constrained to be an object.
 *
 * @example
 * ```ts
 * const schema = z.object({ count: z.number().default(0) });
 * type State = InferObject<typeof schema>; // { count: number }
 * ```
 */
export type InferObject<Schema extends StandardSchemaV1> = GenericObject &
  InferSchema<Schema>;
