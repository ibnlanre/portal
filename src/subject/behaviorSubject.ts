import { SetStateAction } from "react";
import { isSetStateFunction } from "@/utilities";

import type { Subscription } from "@/definition";

abstract class Subject<S> {
  abstract next(value: S): void;
  abstract subscribe(observer: (value: S) => void): Subscription;
  abstract unsubscribe(): void;
}

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template S The type of the initial and emitted values.
 */
export class BehaviorSubject<State> implements Subject<State> {
  private state: State;
  private subscribers: Set<Function>;

  /**
   * Creates a new instance of BehaviorSubject.
   * @param {State} initialValue The initial value of the subject.
   */
  constructor(initialValue: State) {
    /**
     * The current value of the subject.
     * @type {State}
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
  get value(): State {
    return this.state;
  }

  /**
   * Emits a new value to the subject and notifies subscribers.
   * @param {S} value The new value to emit.
   */
  next = (value: State) => {
    if (!Object.is(this.state, value)) {
      this.state = value;
      this.notifySubscribers();
    }
  };

  /**
   * Update the state using the provided value or action.
   * @template State The type of the state.
   *
   * @param {SetStateAction<S, A>} value Value or action to update the state with.
   *
   * @summary If a dispatch function is provided, it is used to process the state update based on the previous state and the value or action.
   * @summary If the dispatch function is not provided and the value is a function, it is called with the previous state and the return value is used as the new state.
   * @summary If neither a dispatch function is provided nor the value is a function, the value itself is used as the new state.
   *
   * @description The updated state is emitted through the observable.next() method.
   *
   * @returns void
   */
  setter = (value: SetStateAction<State>) => {
    try {
      isSetStateFunction<State>(value)
        ? this.next(value(this.state))
        : this.next(value);
    } catch (error) {
      console.error("Error setting the specified value", error);
    }
  };

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} observer The callback function to be called with emitted values.
   * @param {boolean} [immediate=true] Whether to run the callback immediately with the current state. Defaults to `true`.
   *
   * @description
   * When immediate is true, the callback will execute immediately with the current state.
   * When immediate is false or not provided, the callback will only execute after a change has occurred.
   *
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (
    observer: (value: State) => any,
    immediate: boolean = true
  ): Subscription => {
    // Confirm the callback isn't in the subscribers list.
    if (!this.subscribers.has(observer)) {
      // Add the callback as a member in the subscribers list.
      this.subscribers.add(observer);
      if (immediate) observer(this.state);
    }
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
