import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Infers the output type of a Standard Schema.
 *
 * @example
 * ```ts
 * const schema = z.object({ count: z.number().default(0) });
 * type State = InferSchema<typeof schema>; // { count: number }
 * ```
 */
export type InferSchema<Schema extends StandardSchemaV1> =
  StandardSchemaV1.InferOutput<Schema>;
