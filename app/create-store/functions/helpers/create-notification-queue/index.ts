/** Deliver committed snapshots in order, including writes made by listeners. */
export function createNotificationQueue() {
  let draining = false;
  const queue: Array<Array<() => void>> = [];

  return (delivery: Array<() => void>) => {
    queue.push(delivery);
    if (draining) return;
    draining = true;
    const errors: unknown[] = [];
    try {
      for (let index = 0; index < queue.length; index++) {
        for (const notify of queue[index]) {
          try {
            notify();
          } catch (error) {
            errors.push(error);
          }
        }
      }
    } finally {
      queue.length = 0;
      draining = false;
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1)
      throw new AggregateError(errors, "Store subscribers failed");
  };
}
