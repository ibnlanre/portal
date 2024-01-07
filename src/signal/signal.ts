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

  /**
   * Subscribes to changes in the signal.
   *
   * @param {Function} callback The callback function to execute when the signal changes.
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

  static identifier = () => {
    const error = new Error();
    const stack = error.stack?.split("\n").at(3) || "";

    const file = stack.replace(/[^a-zA-Z]/g, "");
    const path = stack.match(/:\d+:\d+/g);
    const filepath = file + path;

    let hash = 0;
    for (const char of filepath) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0;
    }

    return hash;
  };
}

const store = new Map<number, Signal<any>>();

export const signal = <T>(initialValue: T) => {
  const uuid = Signal.identifier();

  if (store.has(uuid)) {
    const instance = store.get(uuid) as Signal<T>;
    instance.value = initialValue;
    return instance;
  }

  const instance = new Signal(initialValue);
  store.set(uuid, instance);
  return instance;
};
