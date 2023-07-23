import { isAction, isSetStateFunction } from "utilities";

import type { Action, Subscription } from "definition";
import type { Reducer } from "react";

abstract class Subject<S> {
  abstract next(value: S): void;
  abstract subscribe(observer: (value: S) => void): Subscription;
  abstract unsubscribe(): void;
}

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template S The type of the initial and emitted values.
 */
export class BehaviorSubject<S> implements Subject<S> {
  private state: S;
  private subscribers: Set<Function>;

  /**
   * Creates a new instance of BehaviorSubject.
   * @param {S} initialValue The initial value of the subject.
   */
  constructor(initialValue: S) {
    /**
     * The current value of the subject.
     * @type {S}
     */
    this.state = initialValue;

    /**
     * The set of subscribers to the subject.
     * @type {Set<Function>}
     */
    this.subscribers = new Set();
  }

  /**
   * Notifies all subscribers with the current value.
   * @protected
   */
  protected notifySubscribers = () => {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.state);
      } catch (err) {
        console.error("Error occurred in subscriber callback:", err);
      }
    });
  };

  /**
   * Returns the current value of the subject.
   * @returns {S} The current value.
   */
  get value(): S {
    return this.state;
  }

  /**
   * Emits a new value to the subject and notifies subscribers.
   * @param {S} value The new value to emit.
   */
  next = (value: S) => {
    if (!Object.is(this.state, value)) {
      this.state = value;
      this.notifySubscribers();
    }
  };

  /**
   * Watch the creation of a state update function for the observable.
   *
   * @template A The type of the actions.
   * @param {Reducer<any, A>} dispatch Optional reducer function to handle state updates.
   * @returns A function that takes a value or action and updates the state accordingly.
   */
  watch = <A = undefined>(dispatch?: Reducer<any, A>) => {
    /**
     * Update the state using the provided value or action.
     * @template S The type of the state.
     * @template A The type of the actions.
     *
     * @param {Action<S, A>} value Value or action to update the state with.
     *
     * @summary If a dispatch function is provided, it is used to process the state update based on the previous state and the value or action.
     * @summary If the dispatch function is not provided and the value is a function, it is called with the previous state and the return value is used as the new state.
     * @summary If neither a dispatch function is provided nor the value is a function, the value itself is used as the new state.
     *
     * @description The updated state is emitted through the observable.next() method.
     *
     * @returns void
     */
    const setter = (value: Action<S, A>) => {
      isAction<S, A>(value, dispatch)
        ? this.next(dispatch?.(this.state, value as A))
        : isSetStateFunction<S>(value)
        ? this.next(value(this.state))
        : this.next(value);
    };

    return setter;
  };

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} observer The callback function to be called with emitted values.
   * @param {boolean} [initiate=true] Whether to initiate the callback immediately with the current state. Defaults to `true`.
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (observer: Function, initiate: boolean = true): Subscription => {
    // Add the callback as a member in the subscribers list
    this.subscribers.add(observer);
    if (initiate) observer(this.state);
    return {
      unsubscribe: () => {
        this.subscribers.delete(observer);
      },
    };
  };

  /**
   * Unsubscribes all subscribers from the subject.
   */
  unsubscribe = (): void => {
    this.subscribers.clear();
  };
}
