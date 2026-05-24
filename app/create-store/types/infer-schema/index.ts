import type { StandardSchema } from "@/create-store/types/schema";

/**
 * Infers the output type of a Standard Schema.
 *
 * @example
 * ```ts
 * const schema = z.object({ count: z.number().default(0) });
 * type State = InferSchema<typeof schema>; // { count: number }
 * ```
 */
export type InferSchema<Schema extends StandardSchema> = NonNullable<
  Schema["~standard"]["types"]
>["output"];
