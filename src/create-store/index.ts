import type { Store } from "@/create-store/types/store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { resolveValue } from "@/create-store/functions/utilities/resolve-value";

export const createStore: Store = <State>(initialState?: State) => {
  const state = resolveValue(initialState);
  if (isDictionary(state)) return createCompositeStore(state);
  return createPrimitiveStore(state);
};

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

import { createLocalStorageAdapter } from "./functions/adapters/create-local-storage-adapter";

const [getLocalStorageState, setLocalStorageState] =
  createLocalStorageAdapter<Source>({
    key: "source",
  });

const safeSource = createStore(getLocalStorageState);
safeSource.$sub(setLocalStorageState);

const source = createStore(() => {
  const value = getLocalStorageState();
  if (value) return value;

  return {
    total_units: 0,
    currency: {
      code: "USD",
      symbol: "$",
    },
    available_units: 0,
    units_on_hold: 0,
    updated: new Date().toISOString(),
    location_code: 0,
    commodity_name: "",
    location_name: "",
    security: {},
    list_of_securities: [
      {
        name: "",
        code: "",
        current_price: 0,
        daily_change: 0,
      },
    ],
    portfolio_value: 0,
    security_closing_price: 0,
    security_volume_per_unit: 0,
    security_best_buy: 0,
    security_best_sell: 0,
  } satisfies Source;
});
source.$sub(setLocalStorageState);

const satch = source.$get();

satch.available_units;
