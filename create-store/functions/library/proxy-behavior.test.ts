import { describe, expect, it } from "vitest";

import { createCompositeStore } from "./create-composite-store";
import { createPrimitiveStore } from "./create-primitive-store";

describe("Proxy Behavior Tests", () => {
  describe("CompositeStore Proxy Shape", () => {
    it("should maintain original object structure with store methods", () => {
      const initialState = {
        count: 42,
        settings: {
          notifications: true,
          theme: "dark",
        },
        user: {
          age: 30,
          name: "John",
        },
      };

      const store = createCompositeStore(initialState);

      // Original properties should be accessible
      expect(store.count).toBeDefined();
      expect(store.user).toBeDefined();
      expect(store.settings).toBeDefined();

      // Store methods should be accessible
      expect(store.$get).toBeTypeOf("function");
      expect(store.$set).toBeTypeOf("function");
      expect(store.$use).toBeTypeOf("function");
      expect(store.$act).toBeTypeOf("function");
      expect(store.$key).toBeTypeOf("function");

      // Nested objects should also have store methods
      expect(store.user.$get).toBeTypeOf("function");
      expect(store.user.$set).toBeTypeOf("function");
      expect(store.settings.$get).toBeTypeOf("function");
      expect(store.settings.$set).toBeTypeOf("function");

      // Deeply nested access should work
      expect(store.user.name).toBeDefined();
      expect(store.user.age).toBeDefined();
      expect(store.settings.theme).toBeDefined();
      expect(store.settings.notifications).toBeDefined();
    });

    it("should handle property enumeration correctly", () => {
      const store = createCompositeStore({
        nested: { prop3: "value3" },
        prop1: "value1",
        prop2: "value2",
      });

      // Object.keys should only include original properties, store methods are non-enumerable
      const keys = Object.keys(store);
      expect(keys).toContain("prop1");
      expect(keys).toContain("prop2");
      expect(keys).toContain("nested");
      expect(keys).not.toContain("$get");
      expect(keys).not.toContain("$set");
      expect(keys).not.toContain("$use");
      expect(keys).not.toContain("$act");
      expect(keys).not.toContain("$key");
    });

    it("should handle 'in' operator correctly", () => {
      const store = createCompositeStore({
        existing: "value",
        nested: { prop: "value" },
      });

      // Should find original properties
      expect("existing" in store).toBe(true);
      expect("nested" in store).toBe(true);

      // Should find store methods
      expect("$get" in store).toBe(true);
      expect("$set" in store).toBe(true);
      expect("$use" in store).toBe(true);
      expect("$act" in store).toBe(true);
      expect("$key" in store).toBe(true);

      // Should not find non-existent properties
      expect("nonExistent" in store).toBe(false);

      // Nested objects should also work
      expect("prop" in store.nested).toBe(true);
      expect("$get" in store.nested).toBe(true);
    });

    it("should handle property descriptors correctly", () => {
      const store = createCompositeStore({
        myProp: "value",
        nested: { innerProp: "innerValue" },
      });

      // Store methods should have proper descriptors - non-enumerable
      const getDescriptor = Object.getOwnPropertyDescriptor(store, "$get");
      expect(getDescriptor).toBeDefined();
      expect(getDescriptor?.enumerable).toBe(false); // Non-enumerable
      expect(getDescriptor?.configurable).toBe(true);

      // Original properties should have getter/setter descriptors
      const propDescriptor = Object.getOwnPropertyDescriptor(store, "myProp");
      expect(propDescriptor).toBeDefined();
      expect(propDescriptor?.enumerable).toBe(true);
      expect(propDescriptor?.configurable).toBe(true);
      expect(propDescriptor?.get).toBeTypeOf("function");
      expect(propDescriptor?.set).toBeTypeOf("function");
    });

    it("should preserve functions without wrapping them", () => {
      const myFunction = () => "hello world";
      const asyncFunction = async () => "async hello";

      const store = createCompositeStore({
        asyncFn: asyncFunction,
        regularProp: "value",
        syncFn: myFunction,
      });

      // Functions should be returned as-is
      expect(store.syncFn).toBe(myFunction);
      expect(store.asyncFn).toBe(asyncFunction);

      // Functions should be callable
      expect(store.syncFn()).toBe("hello world");
      expect(store.asyncFn()).toBeInstanceOf(Promise);

      // Functions should not have store methods (these would be undefined at runtime)
      expect((store.syncFn as any).$get).toBeUndefined();
      expect((store.asyncFn as any).$set).toBeUndefined();
    });

    it("should handle circular references without infinite recursion", () => {
      const obj: any = { name: "circular" };
      obj.self = obj;

      const store = createCompositeStore(obj);

      // Should be able to access circular reference
      expect(store.self).toBeDefined();
      expect(store.self.name.$get()).toBe("circular");
      expect(store.self.self).toBeDefined();

      // Should maintain store methods
      expect(store.self.$get).toBeTypeOf("function");
      expect(store.self.self.$get).toBeTypeOf("function");

      // Should not cause infinite recursion
      expect(() => store.self.self.self.name.$get()).not.toThrow();
    });

    it("should NOT allow setting new properties (strict shape preservation)", () => {
      const store = createCompositeStore({
        existing: "value",
      });

      // Should NOT be able to set new properties - they should be ignored
      expect(() => {
        (store as any).newProp = "new value";
      }).not.toThrow(); // Setting won't throw, but will be ignored

      expect((store as any).newProp).toBeUndefined();
      expect(store.$get()).toEqual({
        existing: "value",
      });

      // Should not be able to override store methods (test at runtime)
      const originalGet = store.$get;
      try {
        (store as any).$get = "should not work";
      } catch {
        // Expected to fail
      }
      expect(store.$get).toBe(originalGet);
    });

    it("should prevent direct property assignment (only allow $set method)", () => {
      const store = createCompositeStore({
        counter: 0,
        name: "initial",
        settings: { enabled: true, theme: "dark" },
      });

      // Store initial values
      const initialName = store.name.$get();
      const initialTheme = store.settings.theme.$get();
      const initialCounter = store.counter.$get();

      // Direct assignments should fail silently and not change values
      (store as any).name = "changed directly";
      (store.settings as any).theme = "light";
      (store as any).counter = 999;

      // Values should remain unchanged
      expect(store.name.$get()).toBe(initialName);
      expect(store.settings.theme.$get()).toBe(initialTheme);
      expect(store.counter.$get()).toBe(initialCounter);

      // But $set should work
      store.name.$set("changed via $set");
      store.settings.$set({ theme: "light" });
      store.counter.$set(999);

      // Values should now be changed
      expect(store.name.$get()).toBe("changed via $set");
      expect(store.settings.theme.$get()).toBe("light");
      expect(store.counter.$get()).toBe(999);
    });
  });

  describe("PrimitiveStore Proxy Shape", () => {
    it("should expose only store methods", () => {
      const store = createPrimitiveStore("initial value");

      // Store methods should be accessible
      expect(store.$get).toBeTypeOf("function");
      expect(store.$set).toBeTypeOf("function");
      expect(store.$use).toBeTypeOf("function");
      expect(store.$act).toBeTypeOf("function");

      // Should be able to call store methods
      expect(store.$get()).toBe("initial value");
      expect(() => store.$set("new value")).not.toThrow();
      expect(store.$get()).toBe("new value");

      // Should NOT have value property - only access through $get()
      expect((store as any).value).toBeUndefined();
    });

    it("should make store methods non-enumerable", () => {
      const store = createPrimitiveStore("test");

      // Object.keys should return empty array - all methods are non-enumerable
      const keys = Object.keys(store);
      expect(keys).toEqual([]);

      // for...in should not iterate over anything
      const forInKeys: string[] = [];
      for (const key in store) {
        forInKeys.push(key);
      }
      expect(forInKeys).toEqual([]);

      // But methods should still be accessible directly
      expect(store.$get()).toBe("test");
    });

    it("should handle 'in' operator for primitive store", () => {
      const store = createPrimitiveStore("test");

      // Store methods should be found
      expect("$get" in store).toBe(true);
      expect("$set" in store).toBe(true);
      expect("$use" in store).toBe(true);
      expect("$act" in store).toBe(true);

      // Value property should NOT be found
      expect("value" in store).toBe(false);

      // Non-existent properties should not be found
      expect("nonExistent" in store).toBe(false);
    });

    it("should handle property descriptors for primitive store", () => {
      const store = createPrimitiveStore("test value");

      // Store methods should have proper descriptors - non-enumerable
      const getDescriptor = Object.getOwnPropertyDescriptor(store, "$get");
      expect(getDescriptor).toBeDefined();
      expect(getDescriptor?.enumerable).toBe(false); // Non-enumerable
      expect(getDescriptor?.configurable).toBe(true);
      expect(getDescriptor?.writable).toBe(false);

      // Value property should NOT have a descriptor
      const valueDescriptor = Object.getOwnPropertyDescriptor(store, "value");
      expect(valueDescriptor).toBeUndefined();
    });

    it("should handle different primitive types", () => {
      const stringStore = createPrimitiveStore("hello");
      const numberStore = createPrimitiveStore(42);
      const booleanStore = createPrimitiveStore(true);
      const nullStore = createPrimitiveStore(null);
      const undefinedStore = createPrimitiveStore(undefined);

      // All should have store methods
      expect(stringStore.$get).toBeTypeOf("function");
      expect(numberStore.$get).toBeTypeOf("function");
      expect(booleanStore.$get).toBeTypeOf("function");
      expect(nullStore.$get).toBeTypeOf("function");
      expect(undefinedStore.$get).toBeTypeOf("function");

      // All should return correct values through $get()
      expect(stringStore.$get()).toBe("hello");
      expect(numberStore.$get()).toBe(42);
      expect(booleanStore.$get()).toBe(true);
      expect(nullStore.$get()).toBe(null);
      expect(undefinedStore.$get()).toBe(undefined);

      // None should have value property
      expect((stringStore as any).value).toBeUndefined();
      expect((numberStore as any).value).toBeUndefined();
      expect((booleanStore as any).value).toBeUndefined();
      expect((nullStore as any).value).toBeUndefined();
      expect((undefinedStore as any).value).toBeUndefined();
    });

    it("should prevent overriding store methods", () => {
      const store = createPrimitiveStore("test");
      const original$get = store.$get;
      const original$set = store.$set;

      // Attempting to override store methods should fail
      try {
        (store as any).$get = "should not work";
      } catch {
        // Expected to fail
      }
      expect(store.$get).toBe(original$get);

      try {
        (store as any).$set = "should not work";
      } catch {
        // Expected to fail
      }
      expect(store.$set).toBe(original$set);
    });

    it("should prevent property definition and deletion", () => {
      const store = createPrimitiveStore(100);

      // Should not be able to add new properties
      expect(() => {
        (store as any).newProperty = "value";
      }).not.toThrow();
      expect((store as any).newProperty).toBeUndefined();

      // Should not be able to define new properties with Object.defineProperty
      expect(() => {
        Object.defineProperty(store, "customProp", {
          enumerable: true,
          value: "test",
        });
      }).not.toThrow();
      expect((store as any).customProp).toBeUndefined();

      // Should not be able to delete store methods
      expect(() => {
        delete (store as any).$get;
      }).not.toThrow();
      expect(typeof store.$get).toBe("function");
    });
  });

  describe("Type Consistency Between Stores", () => {
    it("should maintain consistent API shape between store types", () => {
      const primitiveStore = createPrimitiveStore("test");
      const compositeStore = createCompositeStore({ prop: "test" });

      // Both should have the same store methods
      const primitiveStoreKeys = Object.keys(primitiveStore).filter((key) =>
        key.startsWith("$")
      );
      const compositeStoreKeys = Object.keys(compositeStore).filter((key) =>
        key.startsWith("$")
      );

      // Both should have empty enumerable keys since store methods are non-enumerable
      expect(primitiveStoreKeys).toEqual([]);
      expect(compositeStoreKeys).toEqual([]);

      // But both should have the same method signatures (at least the same names)
      expect(typeof primitiveStore.$get).toBe(typeof compositeStore.$get);
      expect(typeof primitiveStore.$set).toBe(typeof compositeStore.$set);
      expect(typeof primitiveStore.$use).toBe(typeof compositeStore.$use);
      expect(typeof primitiveStore.$act).toBe(typeof compositeStore.$act);
    });

    it("should handle nested primitive-like values in composite store", () => {
      const compositeStore = createCompositeStore({
        booleanValue: true,
        nullValue: null,
        numberValue: 42,
        stringValue: "hello",
        undefinedValue: undefined,
      });

      // All nested values should have store methods
      expect(compositeStore.stringValue.$get).toBeTypeOf("function");
      expect(compositeStore.numberValue.$get).toBeTypeOf("function");
      expect(compositeStore.booleanValue.$get).toBeTypeOf("function");
      expect(compositeStore.nullValue.$get).toBeTypeOf("function");
      expect(compositeStore.undefinedValue.$get).toBeTypeOf("function");

      // All should return correct values
      expect(compositeStore.stringValue.$get()).toBe("hello");
      expect(compositeStore.numberValue.$get()).toBe(42);
      expect(compositeStore.booleanValue.$get()).toBe(true);
      expect(compositeStore.nullValue.$get()).toBe(null);
      expect(compositeStore.undefinedValue.$get()).toBe(undefined);
    });
  });

  describe("Proxy Performance and Memory", () => {
    it("should reuse proxies for the same object references", () => {
      const sharedObject = { shared: "value" };
      const store = createCompositeStore({
        ref1: sharedObject,
        ref2: sharedObject,
      });

      // Both references should point to the same proxy
      expect(store.ref1).toBe(store.ref2);
    });

    it("should handle large object structures efficiently", () => {
      const largeObject: any = {};
      for (let i = 0; i < 100; i++) {
        largeObject[`prop${i}`] = `value${i}`;
      }

      const store = createCompositeStore(largeObject);

      // Should be able to access all properties
      for (let i = 0; i < 100; i++) {
        expect(store[`prop${i}`]).toBeDefined();
        expect(store[`prop${i}`].$get()).toBe(`value${i}`);
      }

      // Should maintain store methods
      expect(store.$get).toBeTypeOf("function");
      expect(Object.keys(store.$get())).toHaveLength(100);
    });

    it("should prevent property additions and maintain strict shape", () => {
      const store = createCompositeStore({
        nested: { prop: "nested value" },
        original: "value",
      });

      // Attempting to add new properties should fail silently
      (store as any).newProp = "should not work";
      expect((store as any).newProp).toBeUndefined();

      // Original shape should be preserved
      expect(Object.keys(store)).toEqual(["nested", "original"]);
      expect(store.$get()).toEqual({
        nested: { prop: "nested value" },
        original: "value",
      });

      // Nested objects should also prevent new properties
      (store.nested as any).newNestedProp = "should not work";
      expect((store.nested as any).newNestedProp).toBeUndefined();
    });

    it("should allow modification of existing properties only through $set method", () => {
      const store = createCompositeStore({
        count: 0,
        user: { age: 30, name: "John" },
      });

      // Should be able to modify existing properties using $set
      store.$set({ count: 42 });
      expect(store.$get()).toHaveProperty("count", 42);

      store.user.$set({ name: "Jane" });
      expect(store.user.$get()).toHaveProperty("name", "Jane");

      // Direct property assignment should NOT work (only through $set)
      (store as any).count = 100;
      expect(store.$get()).toHaveProperty("count", 42); // Should remain unchanged

      (store.user as any).name = "DirectAssignment";
      expect(store.user.$get()).toHaveProperty("name", "Jane"); // Should remain unchanged

      // Should not be able to add new properties
      (store as any).newField = "test";
      (store.user as any).email = "test@example.com";

      expect((store as any).newField).toBeUndefined();
      expect((store.user as any).email).toBeUndefined();

      // Verify final state only has original properties with correct values
      const finalState = store.$get();
      expect(Object.keys(finalState)).toEqual(["count", "user"]);
      expect(Object.keys(finalState.user)).toEqual(["age", "name"]);
      expect(finalState.count).toBe(42); // From $set, not direct assignment
      expect(finalState.user.name).toBe("Jane"); // From $set, not direct assignment
    });
  });
});
