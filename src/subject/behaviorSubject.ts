abstract class Subject<T> {
  abstract next(value: T): void;
  abstract subscribe(observer: (value: T) => void): {
    unsubscribe(): void;
  };
  abstract unsubscribe(): void;
}

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template T The type of the initial and emitted values.
 */
export class BehaviorSubject<T> implements Subject<T> {
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

    // bindings to protect against undefined `this`.
    this.notifySubscribers = this.notifySubscribers.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.next = this.next.bind(this);
  }

  /**
   * Notifies all subscribers with the current value.
   * @protected
   */
  protected notifySubscribers() {
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
   * @param {Function} observer The callback function to be called with emitted values.
   * @param {boolean} [initiate=true] Whether to initiate the callback immediately with the current state. Defaults to `true`.
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe(observer: Function, initiate: boolean = true) {
    // Add the callback as a member in the subscribers list
    this.subscribers.add(observer);
    if (initiate) observer(this.state);
    return {
      unsubscribe: () => {
        this.subscribers.delete(observer);
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
