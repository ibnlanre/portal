import type { DeepPartial } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("DeepPartial Type", () => {
  describe("Basic functionality", () => {
    it("should make all properties optional", () => {
      type User = {
        active: boolean;
        id: number;
        name: string;
      };

      type PartialUser = DeepPartial<User>;

      expectTypeOf<PartialUser>().toEqualTypeOf<{
        active?: boolean;
        id?: number;
        name?: string;
      }>();
    });

    it("should work with empty objects", () => {
      type Empty = {};
      type PartialEmpty = DeepPartial<Empty>;

      expectTypeOf<PartialEmpty>().toEqualTypeOf<{}>();
    });

    it("should preserve already optional properties", () => {
      type User = {
        email?: string;
        id: number;
        name?: string;
      };

      type PartialUser = DeepPartial<User>;

      expectTypeOf<PartialUser>().toEqualTypeOf<{
        email?: string;
        id?: number;
        name?: string;
      }>();
    });
  });

  describe("Nested objects", () => {
    it("should make nested object properties optional recursively", () => {
      type User = {
        id: number;
        profile: {
          name: string;
          settings: {
            notifications: boolean;
            theme: string;
          };
        };
      };

      type PartialUser = DeepPartial<User>;

      expectTypeOf<PartialUser>().toEqualTypeOf<{
        id?: number;
        profile?: {
          name?: string;
          settings?: {
            notifications?: boolean;
            theme?: string;
          };
        };
      }>();
    });

    it("should handle deeply nested structures", () => {
      type DeepNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: string;
              };
            };
          };
        };
      };

      type PartialDeepNested = DeepPartial<DeepNested>;

      expectTypeOf<PartialDeepNested>().toEqualTypeOf<{
        level1?: {
          level2?: {
            level3?: {
              level4?: {
                value?: string;
              };
            };
          };
        };
      }>();
    });

    it("should handle mixed nested and flat properties", () => {
      type Mixed = {
        anotherFlat: symbol;
        flatProp: string;
        nested: {
          deepNested: {
            value: boolean;
          };
          innerFlat: number;
        };
      };

      type PartialMixed = DeepPartial<Mixed>;

      expectTypeOf<PartialMixed>().toEqualTypeOf<{
        anotherFlat?: symbol;
        flatProp?: string;
        nested?: {
          deepNested?: {
            value?: boolean;
          };
          innerFlat?: number;
        };
      }>();
    });
  });

  describe("Built-in types preservation", () => {
    it("should preserve primitive types", () => {
      type Result1 = DeepPartial<string>;
      type Result2 = DeepPartial<number>;
      type Result3 = DeepPartial<boolean>;
      type Result4 = DeepPartial<symbol>;
      type Result5 = DeepPartial<bigint>;

      expectTypeOf<Result1>().toEqualTypeOf<string>();
      expectTypeOf<Result2>().toEqualTypeOf<number>();
      expectTypeOf<Result3>().toEqualTypeOf<boolean>();
      expectTypeOf<Result4>().toEqualTypeOf<symbol>();
      expectTypeOf<Result5>().toEqualTypeOf<bigint>();
    });

    it("should preserve Date objects", () => {
      type Result = DeepPartial<Date>;
      expectTypeOf<Result>().toEqualTypeOf<Date>();

      type WithDate = { created: Date; name: string };
      type PartialWithDate = DeepPartial<WithDate>;

      expectTypeOf<PartialWithDate>().toEqualTypeOf<{
        created?: Date;
        name?: string;
      }>();
    });

    it("should preserve RegExp objects", () => {
      type Result = DeepPartial<RegExp>;
      expectTypeOf<Result>().toEqualTypeOf<RegExp>();

      type WithRegExp = { flags: string; pattern: RegExp };
      type PartialWithRegExp = DeepPartial<WithRegExp>;

      expectTypeOf<PartialWithRegExp>().toEqualTypeOf<{
        flags?: string;
        pattern?: RegExp;
      }>();
    });

    it("should preserve Error objects", () => {
      type Result = DeepPartial<Error>;
      expectTypeOf<Result>().toEqualTypeOf<Error>();

      type WithError = { error: Error; message: string };
      type PartialWithError = DeepPartial<WithError>;

      expectTypeOf<PartialWithError>().toEqualTypeOf<{
        error?: Error;
        message?: string;
      }>();
    });

    it("should preserve null and undefined", () => {
      type Result1 = DeepPartial<null>;
      type Result2 = DeepPartial<undefined>;

      expectTypeOf<Result1>().toEqualTypeOf<null>();
      expectTypeOf<Result2>().toEqualTypeOf<undefined>();
    });
  });

  describe("Array types", () => {
    it("should preserve array types", () => {
      type Result1 = DeepPartial<string[]>;
      type Result2 = DeepPartial<number[]>;
      type Result3 = DeepPartial<boolean[]>;

      expectTypeOf<Result1>().toEqualTypeOf<string[]>();
      expectTypeOf<Result2>().toEqualTypeOf<number[]>();
      expectTypeOf<Result3>().toEqualTypeOf<boolean[]>();
    });

    it("should preserve tuple types", () => {
      type Tuple = [string, number, boolean];
      type Result = DeepPartial<Tuple>;

      expectTypeOf<Result>().toEqualTypeOf<[string, number, boolean]>();
    });

    it("should handle objects with array properties", () => {
      type WithArrays = {
        items: string[];
        nested: {
          values: number[];
        };
        tuple: [number, boolean];
      };

      type PartialWithArrays = DeepPartial<WithArrays>;

      expectTypeOf<PartialWithArrays>().toEqualTypeOf<{
        items?: string[];
        nested?: {
          values?: number[];
        };
        tuple?: [number, boolean];
      }>();
    });
  });

  describe("Function types", () => {
    it("should preserve function types", () => {
      type Fn1 = () => string;
      type Fn2 = (x: number) => boolean;
      type Fn3 = (a: string, b: number) => void;

      type Result1 = DeepPartial<Fn1>;
      type Result2 = DeepPartial<Fn2>;
      type Result3 = DeepPartial<Fn3>;

      expectTypeOf<Result1>().toEqualTypeOf<Fn1>();
      expectTypeOf<Result2>().toEqualTypeOf<Fn2>();
      expectTypeOf<Result3>().toEqualTypeOf<Fn3>();
    });

    it("should handle objects with function properties", () => {
      type WithFunctions = {
        handler: () => void;
        nested: {
          callback: (data: number) => string;
        };
        validator: (input: string) => boolean;
      };

      type PartialWithFunctions = DeepPartial<WithFunctions>;

      expectTypeOf<PartialWithFunctions>().toEqualTypeOf<{
        handler?: () => void;
        nested?: {
          callback?: (data: number) => string;
        };
        validator?: (input: string) => boolean;
      }>();
    });
  });

  describe("Union and intersection types", () => {
    it("should handle union types", () => {
      type Union = number | string;
      type Result = DeepPartial<Union>;

      expectTypeOf<Result>().toEqualTypeOf<number | string>();
    });

    it("should handle objects with union property types", () => {
      type WithUnion = {
        nested: {
          data: boolean | null;
        };
        value: number | string;
      };

      type PartialWithUnion = DeepPartial<WithUnion>;

      expectTypeOf<PartialWithUnion>().toEqualTypeOf<{
        nested?: {
          data?: boolean | null;
        };
        value?: number | string;
      }>();
    });

    it("should handle intersection types", () => {
      type Base = { id: number };
      type Extended = { name: string };
      type Intersection = Base & Extended;

      type PartialIntersection = DeepPartial<Intersection>;

      expectTypeOf<PartialIntersection>().toEqualTypeOf<{
        id?: number;
        name?: string;
      }>();
    });
  });

  describe("Special types", () => {
    it("should handle never type", () => {
      type Result = DeepPartial<never>;
      expectTypeOf<Result>().toEqualTypeOf<never>();
    });

    it("should handle any type", () => {
      type Result = DeepPartial<any>;
      expectTypeOf<Result>().toEqualTypeOf<any>();
    });

    it("should handle unknown type", () => {
      type Result = DeepPartial<unknown>;
      expectTypeOf<Result>().toEqualTypeOf<unknown>();
    });

    it("should handle void type", () => {
      type Result = DeepPartial<void>;
      expectTypeOf<Result>().toEqualTypeOf<void>();
    });
  });

  describe("Generic objects", () => {
    it("should work with generic types", () => {
      type Container<T> = {
        metadata: {
          created: Date;
          type: string;
        };
        value: T;
      };

      type PartialContainer<T> = DeepPartial<Container<T>>;

      expectTypeOf<PartialContainer<string>>().toEqualTypeOf<{
        metadata?: {
          created?: Date;
          type?: string;
        };
        value?: string;
      }>();
    });

    it("should handle conditional types", () => {
      type ConditionalType<T> = T extends string ? { text: T } : { value: T };

      type StringResult = DeepPartial<ConditionalType<string>>;
      type NumberResult = DeepPartial<ConditionalType<number>>;

      expectTypeOf<StringResult>().toEqualTypeOf<{ text?: string }>();
      expectTypeOf<NumberResult>().toEqualTypeOf<{ value?: number }>();
    });
  });

  describe("Readonly properties", () => {
    it("should handle readonly properties", () => {
      type WithReadonly = {
        readonly config: {
          readonly apiUrl: string;
          timeout: number;
        };
        readonly id: number;
        mutable: string;
      };

      type PartialWithReadonly = DeepPartial<WithReadonly>;

      expectTypeOf<PartialWithReadonly>().toEqualTypeOf<{
        readonly config?: {
          readonly apiUrl?: string;
          timeout?: number;
        };
        readonly id?: number;
        mutable?: string;
      }>();
    });
  });

  describe("Index signatures", () => {
    it("should handle objects with index signatures", () => {
      type WithIndex = {
        [key: string]: unknown;
        specific: string;
      };

      type PartialWithIndex = DeepPartial<WithIndex>;

      expectTypeOf<PartialWithIndex>().toEqualTypeOf<{
        [key: string]: unknown;
        specific?: string;
      }>();
    });

    it("should handle Record types", () => {
      type StringRecord = Record<string, number>;
      type PartialStringRecord = DeepPartial<StringRecord>;

      expectTypeOf<PartialStringRecord>().toEqualTypeOf<{
        [x: string]: number | undefined;
      }>();
    });
  });

  describe("Complex real-world scenarios", () => {
    it("should handle API response types", () => {
      type ApiResponse = {
        data: {
          pagination: {
            hasNext: boolean;
            page: number;
            total: number;
          };
          users: Array<{
            id: number;
            profile: {
              avatar: string;
              name: string;
              settings: {
                notifications: boolean;
                theme: "dark" | "light";
              };
            };
          }>;
        };
        meta: {
          timestamp: Date;
          version: string;
        };
      };

      type PartialApiResponse = DeepPartial<ApiResponse>;

      expectTypeOf<PartialApiResponse>().toEqualTypeOf<{
        data?: {
          pagination?: {
            hasNext?: boolean;
            page?: number;
            total?: number;
          };
          users?: Array<{
            id: number;
            profile: {
              avatar: string;
              name: string;
              settings: {
                notifications: boolean;
                theme: "dark" | "light";
              };
            };
          }>;
        };
        meta?: {
          timestamp?: Date;
          version?: string;
        };
      }>();
    });

    it("should handle form state types", () => {
      type FormState = {
        errors: {
          email?: string;
          password?: string;
          profile?: {
            firstName?: string;
            lastName?: string;
          };
        };
        touched: {
          email: boolean;
          password: boolean;
          profile: {
            firstName: boolean;
            lastName: boolean;
          };
        };
        values: {
          email: string;
          password: string;
          profile: {
            firstName: string;
            lastName: string;
            preferences: {
              newsletter: boolean;
              theme: string;
            };
          };
        };
      };

      type PartialFormState = DeepPartial<FormState>;

      expectTypeOf<PartialFormState>().toEqualTypeOf<{
        errors?: {
          email?: string;
          password?: string;
          profile?: {
            firstName?: string;
            lastName?: string;
          };
        };
        touched?: {
          email?: boolean;
          password?: boolean;
          profile?: {
            firstName?: boolean;
            lastName?: boolean;
          };
        };
        values?: {
          email?: string;
          password?: string;
          profile?: {
            firstName?: string;
            lastName?: string;
            preferences?: {
              newsletter?: boolean;
              theme?: string;
            };
          };
        };
      }>();
    });
  });

  describe("Type relationships with toExtend", () => {
    it("should test extends relationships", () => {
      type Original = { id: number; name: string };
      type Partial = DeepPartial<Original>;

      expectTypeOf<Partial>().toExtend<{ id?: number; name?: string }>();
      expectTypeOf<{ id?: number; name?: string }>().toExtend<Partial>();
    });

    it("should maintain type compatibility", () => {
      type User = {
        id: number;
        profile: {
          name: string;
        };
      };

      type PartialUser = DeepPartial<User>;

      // Partial should be assignable to original when all props are provided
      const completeUser: User = {
        id: 1,
        profile: { name: "John" },
      };

      expectTypeOf<typeof completeUser>().toMatchTypeOf<PartialUser>();
    });
  });

  describe("Edge cases", () => {
    it("should handle circular reference types", () => {
      type CircularType = {
        name: string;
        self?: CircularType;
      };

      type PartialCircular = DeepPartial<CircularType>;

      expectTypeOf<PartialCircular>().toEqualTypeOf<{
        name?: string;
        self?: PartialCircular;
      }>();
    });

    it("should handle very deep nesting", () => {
      type VeryDeep = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: string;
                };
              };
            };
          };
        };
      };

      type PartialVeryDeep = DeepPartial<VeryDeep>;

      expectTypeOf<PartialVeryDeep>().toEqualTypeOf<{
        a?: {
          b?: {
            c?: {
              d?: {
                e?: {
                  f?: string;
                };
              };
            };
          };
        };
      }>();
    });

    it("should handle objects with symbol keys", () => {
      const sym = Symbol("test");
      type WithSymbol = {
        regular: number;
        [sym]: string;
      };

      type PartialWithSymbol = DeepPartial<WithSymbol>;

      expectTypeOf<PartialWithSymbol>().toEqualTypeOf<{
        regular?: number;
        [sym]?: string;
      }>();
    });
  });
});
