/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template T The type of the initial and emitted values.
 */
export class BehaviorSubject<T> {
  private state: T;
  private subscribers: Set<Function>;

  /**
   * Creates a new instance of BehaviorSubject.
   * @param {T} initialValue The initial value of the subject.
   */
  constructor(initialValue: T) {
    /**
     * The current value of the subject.
     * @type {T}
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
   * @private
   */
  private notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.state);
      } catch (err) {
        console.error("Error occurred in subscriber callback:", err);
      }
    });
  }

  /**
   * Returns the current value of the subject.
   * @returns {T} The current value.
   */
  get value(): T {
    return this.state;
  }

  /**
   * Emits a new value to the subject and notifies subscribers.
   * @param {T} value The new value to emit.
   */
  next(value: T) {
    if (!Object.is(this.state, value)) {
      this.state = value;
      this.notifySubscribers();
    }
  }

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} callback The callback function to be called with emitted values.
   * @returns {Function} A function to unsubscribe the callback.
   */
  subscribe(callback: Function) {
    // Add the callback as a member in the subscribers list
    this.subscribers.add(callback);

    return {
      unsubscribe: () => {
        this.subscribers.delete(callback);
      },
    };
  }

  /**
   * Unsubscribes all subscribers from the subject.
   */
  unsubscribe(): void {
    this.subscribers.clear();
  }
}
