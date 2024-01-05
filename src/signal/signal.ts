import { useEffect, useState } from "react";

/**
 * Represents a signal that maintains a current value and emits it to subscribers.
 * @template T The type of the initial value.
 */
class Signal<T> {
  /**
   * The current value of the signal.
   */
  private state: T = undefined as T;

  /**
   * The set of subscribers to the signal.
   */
  private subscribers: Set<(data: T) => void> = new Set();

  /**
   * Custom hook to subscribe to changes in the signal.
   * @returns {T} The current value.
   */
  private use(initialValue: T = this.state) {
    const [value, setValue] = useState(initialValue);
    useEffect(() => this.subscribe(setValue), []);
    return value;
  }

  /**
   * Subscribes to changes in the signal.
   *
   * @param {Function} observer The callback function to execute when the signal changes.
   * @param {boolean} [immediate=true] Whether to run the callback immediately with the current state. Defaults to `true`.
   *
   * @description
   * When immediate is true, the callback will execute immediately with the current state.
   * When immediate is false or not provided, the callback will only execute after a change has occurred.
   *
   * @returns {Function} A function to unsubscribe the callback.
   */
  subscribe = (callback: (value: T) => void, immediate = true) => {
    const unsubscribe = () => {
      this.subscribers.delete(callback);
    };

    if (this.subscribers.has(callback)) return unsubscribe;
    if (immediate) callback(this.state);

    this.subscribers.add(callback);
    return unsubscribe;
  };

  constructor(initialValue: T = undefined as T) {
    this.state = initialValue;
  }

  /**
   * Returns the current value of the signal.
   * @returns {T} The current value.
   */
  get value() {
    return this.state;
  }

  /**
   * Emits a new value to the signal and notifies subscribers.
   * @param {T} newValue The new value to emit.
   * @returns {void}
   */
  set value(newValue: T) {
    this.state = newValue;

    // Notify all subscribers of the new value.
    this.subscribers.forEach((fn) => fn(newValue));
  }

  /**
   * Returns the current value of the signal.
   * @returns {T} The current value.
   */
  get current() {
    return this.use();
  }
}

export const signal = <T>(initialValue: T) => new Signal(initialValue);
