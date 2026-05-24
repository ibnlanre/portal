export interface StandardIssue {
  readonly message: string;
  readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[];
}

export type StandardResult<Output> =
  | { readonly issues: readonly StandardIssue[] }
  | { readonly issues?: undefined; readonly value: Output };

/**
 * The Standard Schema V1 interface.
 *
 * A vendor-neutral contract that schema libraries (Zod, Valibot, ArkType, etc.)
 * can implement so that consumers like `createStore` can work with any of them
 * without a hard runtime dependency on any single library.
 *
 * @see https://standardschema.dev
 */
export interface StandardSchema<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly types?:
      | undefined
      | { readonly input: Input; readonly output: Output };
    readonly validate: (
      value: unknown
    ) => Promise<StandardResult<Output>> | StandardResult<Output>;
    readonly vendor: string;
    readonly version: 1;
  };
}
