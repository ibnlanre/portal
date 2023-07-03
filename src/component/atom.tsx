import type { Reducer } from "react";

import { getComputedState, objectToStringKey } from "../utilities";
import { BehaviorSubject } from "../subject";
import type { Initial, PortalEntry } from "../entries";


export class Atom<S, A = undefined> {
  private _portal = new Map();
  private _state: S;
  private _key: string;
  private _reducer?: Reducer<S, A>;

  constructor(key: any, initialState: Initial<S>, reducer?: Reducer<S, A>) {
    this._state = getComputedState(initialState) as S;
    this._key = objectToStringKey(key);

    if (reducer) this._reducer = reducer;
    const entry: PortalEntry<S, A> = {
      observable: new BehaviorSubject(this._state),
      reducer,
    };
    this._portal.set(this._key, entry);
  }

  destructure() {
    return {
      key: this._key,
      storedState: this._state,
      reducer: this._reducer,
    };
  }

  getItem() {
    return this._portal.get(this._key);
  }

  setItem(value: S) {
    this._portal.set(this._key, value);
  }
}
