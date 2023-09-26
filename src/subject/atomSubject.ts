import { Subscription } from "definition";

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template State The type of the initial and emitted values.
 */
export class AtomSubject<State> {
  private state: State;
  private history: State[] = [];
  private subscribers: Set<Function>;
  private currentIndex: number;

  /**
   * Creates a new instance of AtomSubject.
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
    this.currentIndex = 0;
    this.history.push(initialValue);
  }

  /**
   * Returns the current value of the subject.
   * @returns {State} The current value.
   */
  get value(): State {
    return this.state;
  }
  /**
   * Determines whether it is possible to perform an undo operation.
   * @returns {boolean} `true` if an undo operation can be performed, `false` otherwise.
   */
  get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Determines whether it is possible to perform a redo operation.
   * @returns {boolean} `true` if a redo operation can be performed, `false` otherwise.
   */
  get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Updates the state with a new value and keeps a history for time-travel.
   *
   * @param {State} value The new state value to set.
   * @returns {State} The updated state value.
   */
  next = (value: State): State => {
    if (!Object.is(this.state, value)) {
      // Update the current state with the new value
      this.state = value;

      // Keep a history of state values for time-travel
      // Splice any future history beyond the current index
      this.history.splice(this.currentIndex + 1);

      // Push the new state value into the history
      this.history.push(value);

      // Update the current index to point to the newly added state value
      this.currentIndex = this.history.length - 1;

      // Notify subscribers about the state change
      this.notifySubscribers();
    }

    return value;
  };

  /**
   * Retrieves the previous state from the history for time-travel.
   * @returns {State | undefined} The previous state, or undefined if there is no previous state.
   */
  previous = (): State | undefined => {
    // Calculate the index of the previous state
    const currentIndex = this.currentIndex - 1;

    // If currentIndex is 0, return the current state
    if (!currentIndex) return this.state;

    // If currentIndex is greater than 0, retrieve the previous state from history
    if (currentIndex > 0) {
      return this.history[currentIndex];
    }

    // If there is no previous state, return undefined
    return undefined;
  };

  /**
   * Reverts to the previous state from the history for undoing an action.
   */
  undo = () => {
    // Check if there is a previous state to undo to
    if (this.canUndo) {
      // Decrement the currentIndex to move to the previous state
      this.currentIndex--;

      // Set the current state to the previous state from history
      this.state = this.history[this.currentIndex] as State;

      // Notify subscribers that the state has changed
      this.notifySubscribers();
    }
  };

  /**
   * Moves forward in the history to redo an action.
   */
  redo = () => {
    // Check if there is a state to redo to
    if (this.canRedo) {
      // Increment the currentIndex to move forward in history
      this.currentIndex++;

      // Set the current state to the next state from history
      this.state = this.history[this.currentIndex] as State;

      // Notify subscribers that the state has changed
      this.notifySubscribers();
    }
  };

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} observer The callback function to be called with emitted values.
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (observer: (value: State) => any): Subscription => {
    // Check if the observer is not already subscribed
    if (!this.subscribers.has(observer)) {
      // Add the observer to the subscribers and notify it with the current state
      this.subscribers.add(observer);
      observer(this.state);
    }

    // Return an object with an unsubscribe function
    return {
      /**
       * Unsubscribes the observer from further updates.
       */
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

  /**
   * Notifies all subscribers with the current value.
   * If a subscriber's callback throws an error, it's caught and logged.
   *  @protected
   */
  protected notifySubscribers = () => {
    // Iterate through all subscribers and invoke their callbacks with the current state
    this.subscribers.forEach((callback) => {
      try {
        callback(this.state);
      } catch (err) {
        // Catch and log any errors that occur in subscriber callbacks
        console.error("Error occurred in subscriber callback:", err);
      }
    });
  };
}
