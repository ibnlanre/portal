import { portal } from "./portal";
import { removeItemFromEntries } from "./removeItemFromEntries";

/**
 * Clears all entries from the portal.
 * @returns {void}
 */
export const clearEntries = () => {
  portal.forEach((value) => {
    removeItemFromEntries(value);
  });
};
