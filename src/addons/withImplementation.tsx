import { useState, useEffect } from "react";
import type { Reducer, SetStateAction, Dispatch } from "react";
import { BehaviorSubject } from "rxjs";

import { usePortalEntries } from "../entries";
import { usePortalReducers } from "../reducers";
import { isFunction, updateState } from "../utilities";

/**
 * @template S
 * @template A
 * @typedef {Dispatch<A | SetStateAction<S>>} Dispatcher
 */
export type Dispatcher<S, A> = A extends undefined
  ? Dispatch<SetStateAction<S>>
  : Dispatch<A>;

/**
 * @template S
 * @template A
 * @typedef {typeof initialState, Dispatcher<S, A>} UsePortalResult
 */
export type UsePortalResult<S, A = undefined> = [S, Dispatcher<S, A>];

/**
 * @template S
 * @typedef {S | (() => S) | Promise<S>} Initial
 */
export type Initial<S> = S | (() => S) | Promise<S>;

type IsString<K> = K extends string ? K : never;
export type PortalKeys<T extends Record<string, any>> = IsString<keyof T>;

export function usePortalImplementation<S, A>(
  key: string,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): UsePortalResult<S, A> {
  const { reducers, addItemToReducers } = usePortalReducers<S, A>();
  const { entries, addItemToEntries } = usePortalEntries<
    string,
    BehaviorSubject<S>
  >();

  try {
    const [subject] = useState<BehaviorSubject<S>>(() => {
      const computedState =
        initialState instanceof Promise
          ? undefined
          : isFunction(initialState)
          ? initialState()
          : initialState;
      return new BehaviorSubject(computedState as S);
    });

    useEffect(() => {
      let isSubscribed = true;

      if (initialState instanceof Promise) {
        initialState.then((value) => {
          if (isSubscribed) subject.next(value);
        });
      }
      
      return () => {
        isSubscribed = false;
      };
    }, [initialState, subject]);

    const observable = entries.get(key) ?? subject;
    const [state, setState] = useState(observable.getValue());

    useEffect(() => {
      if (!entries.has(key)) addItemToEntries(key, subject);
      if (reducer && !reducers.has(key)) addItemToReducers(key, reducer);
    }, []);

    useEffect(() => {
      const subscription = observable.subscribe(setState);

      // Unsubscribes when the component unmounts from the DOM
      return () => subscription?.unsubscribe();
    }, []);

    const dispatch = reducers.get(key) ?? reducer;
    const setter = updateState<S, A>(observable, state, dispatch);
    return [state, setter];
  } catch (e) {
    if (!entries || !reducers) {
      throw new Error("usePortal must be used within a PortalProvider");
    }
  }

  return [] as any;
}
