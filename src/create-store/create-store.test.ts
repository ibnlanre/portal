import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { describe, expect, it, vi } from "vitest";
import { createStore } from "./index";

vi.mock("@/create-store/functions/library/create-composite-store");
vi.mock("@/create-store/functions/library/create-primitive-store");

const initialState = {
  name: "John Doe",
  age: 12,
  isStudent: true,
  isTeacher: false,
  height: 5.6,
  relationship: {
    status: "single",
    partner: "none",
  },
  location: {
    state: "CA",
    country: "US",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      zip: "94105",
      phone: "415-555-1234",
      info: {
        name: "John Doe",
        age: 30,
      },
    },
  },
};

describe("createStore", () => {
  it("should create a primitive store when initial state is undefined", () => {
    createStore();
    expect(createPrimitiveStore).toHaveBeenCalled();
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when initial state is a dictionary", () => {
    const initialState = { key: "value" };

    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store when initial state is not a dictionary", () => {
    const initialState = "not a dictionary";
    createStore(initialState);
    expect(createPrimitiveStore).toHaveBeenCalledWith(initialState);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should handle initial state as a function", () => {
    const initialState = vi.fn(() => ({ key: "value" }));

    createStore(initialState);
    expect(initialState).toHaveBeenCalled();
    expect(createCompositeStore).toHaveBeenCalledWith({ key: "value" });
  });

  it("should allow using composite store methods", () => {
    const composite = createStore(initialState);

    const [store, setStore] = composite.$use();
    expect(store).toEqual(initialState);

    const [street, setStreet] = composite.$use("location.address.street");
    expect(street).toBe("123 Main St");

    const value = composite.$get();
    expect(value).toEqual(initialState);

    const streetValue = composite.$get("location.address.street");
    expect(streetValue).toBe("123 Main St");

    const setValue = composite.$set();
    setValue({ ...initialState, name: "Jane Doe" });
    expect(composite.$get().name).toBe("Jane Doe");

    const setStreetValue = composite.$set("location.address.street");
    setStreetValue("456 Elm St");
    expect(composite.$get("location.address.street")).toBe("456 Elm St");

    const unsubscribe = composite.$sub((value) => {
      console.log("Composite store changed", value);
    });
    unsubscribe();

    const unsubscribeStreet = composite.$sub((value) => {
      console.log("Street changed", value);
    }, "location.address.street");
    unsubscribeStreet();
  });
});
