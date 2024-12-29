import type { CompositeStore } from "@/store/types/composite-store";
import type { Dictionary } from "@/store/types/dictionary";
import type { Factory } from "@/store/types/factory";
import type { PrimitiveStore } from "@/store/types/primitive-store";

import { isDictionary } from "@/store/functions/assertions/is-dictionary";
import { isFunction } from "@/store/functions/assertions/is-function";
import { createCompositeStore } from "@/store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/store/functions/library/create-primitive-store";

export function createStore<State extends Dictionary>(
  state: Factory<State>
): CompositeStore<State>;

export function createStore<State = undefined>(
  state?: Factory<State>
): PrimitiveStore<State>;

export function createStore<State = undefined>(initialState?: State) {
  let state: State;

  try {
    if (isFunction<State>(initialState)) state = initialState();
    else state = <State>initialState;
  } catch (exception: unknown) {
    const message = "The initial state function threw an error.";
    const warning = "The store will be initialized with undefined.";

    console.warn(message, warning);
    console.error(exception);

    state = <State>undefined;
  }

  if (isDictionary(state)) return createCompositeStore(state);
  return createPrimitiveStore(state);
}

type State = {
  location: {
    state: string;
    country: string;
    address: {
      street: string;
      city: string;
      zip: string;
      phone: string;
      info: {
        name: string;
        age: number;
      };
    };
  };
};

const state = createStore<State>(); // Primitive store: because the initial state is undefined
const [stateValue, setStateValue] = state.$use();

const basic = createStore(() => new Date().toISOString());
const [basicValue, setBasicValue] = basic.$use();
const getterBasicValue = basic.$get();
const setterBasicValue = basic.$set();

const composite = createStore({
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
});

const [store, setStore] = composite.$use();
const [street, setStreet] = composite.$use("location.address.street");

const setValue = composite.$set();
const setStreetValue = composite.$set("location.address.street");

const value = composite.$get();
const streetValue = composite.$get("location.address.street");

const unsubscribe = composite.$sub((value) => {
  console.log("Composite store changed", value);
});
const unsubscribeStreet = composite.$sub((value) => {
  console.log("Street changed", value);
}, "location.address.street");

const [name, setName] = composite.$use("name");
const [age, setAge] = composite.$use("relationship.partner");

type Source = {
  total_units: number;
  currency: {
    code: string;
    symbol: string;
  };
  available_units: number;
  units_on_hold: number;
  updated: string;
  location_code: number;
  commodity_name: string;
  location_name: string;
  security: Partial<{
    name: string;
    code: string;
    current_price: number;
    daily_change: number;
  }>;
  list_of_securities: [
    {
      name: string;
      code: string;
      current_price: number;
      daily_change: number;
    }
  ];
  portfolio_value: number;
  security_closing_price: number;
  security_volume_per_unit: number;
  security_best_buy: number;
  security_best_sell: number;
};
