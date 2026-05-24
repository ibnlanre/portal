import type { StandardSchema } from "@/create-store/types/schema";

/**
 * Checks whether a value implements the Standard Schema V1 protocol.
 *
 * @param value The value to check.
 * @returns A boolean indicating whether the value is a Standard Schema.
 */
export function isSchema(value: unknown): value is StandardSchema {
  return (
    typeof value === "object" &&
    value !== null &&
    "~standard" in value &&
    typeof (value as Record<string, unknown>)["~standard"] === "object"
  );
}
