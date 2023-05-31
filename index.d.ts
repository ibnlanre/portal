// Type definitions for @ibnlanre/portal
// Definitions by: Ridwan Olanrewaju <https://www.github.com/ibnlanre>

import { Reducer, SetStateAction, action } from "react";
import { BehaviorSubject } from "rxjs";

declare global {
  declare var __$portal_ENTRIES: PortalKeys<string, PortalValue>;
  declare var __$portal_REDUCERS: PortalReducers<PortalValue, any>;

  type PortalKeys<K, V> = Map<K, V>;
  type PortalReducers<V, A> = WeakMap<BehaviorSubject<V>, Reducer<V, A>>;
  type PortalValue = PortalKeys extends Map<string, infer I> ? I : never;
}

export {};
