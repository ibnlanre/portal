type Key<K, P extends string[] = []> = () => [...P, K];

type KeyBuilder<T extends Record<string, any>, P extends string[] = []> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (
        ...args: Parameters<T[K]>
      ) => [...P, Extract<K, string>, ...Parameters<T[K]>]
    : T[K] extends Record<string, any>
    ? Key<K, P> & KeyBuilder<T[K], [...P, Extract<K, string>]>
    : Key<K, P>;
};

/**
 * Returns a builder object that represents the nested keys of the provided object.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to traverse and retrieve the nested keys.
 * @param {string[]} [path=[]] - The current path of keys (used internally for recursion).
 * @returns {KeyBuilder<T>} - A builder object with callable functions representing the nested keys.
 */
function getNestedKeys<T extends Record<string, any>>(
  obj: T,
  path: string[] = []
): KeyBuilder<T> {
  const keys = Object.keys(obj) as Array<keyof T>;

  const builder = keys.reduce((acc, key) => {
    const value = obj[key];
    const newPath = [...path, key as string];

    if (typeof value === "function") {
      return {
        ...acc,
        [key]: (...args: Parameters<typeof value>) => [...newPath, ...args],
      };
    }

    if (typeof value === "object" && value !== null) {
      return {
        ...acc,
        [key]: Object.assign(() => newPath, getNestedKeys(value, newPath)),
      };
    }

    return {
      ...acc,
      [key]: () => newPath,
    };
  }, {}) as KeyBuilder<T>;

  return builder;
}

const noticeKeyConfig = {
  notices: {
    list: {
      all: (
        kidId: number,
        filter: { keyword: string; isFavorite: boolean }
      ) => [kidId, filter],
      favorite: (
        kidId: number,
        filter: { keyword: string; isFavorite: boolean }
      ) => [kidId, filter],
    },
    detail: undefined,
  },
};

const keys = getNestedKeys(noticeKeyConfig);
const detail = keys.notices.detail();
const list = keys.notices.list.all(8, { keyword: "well", isFavorite: false });
