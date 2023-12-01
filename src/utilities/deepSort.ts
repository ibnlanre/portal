function arraySort(a: any, b: any): number {
  const aKey = JSON.stringify(a);
  const bKey = JSON.stringify(b);

  return aKey.localeCompare(bKey);
}

export function deepSort(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(deepSort).sort(arraySort);
  }

  if (typeof data === "object") {
    const sortedObject: any = {};
    const keys = Object.keys(data).sort();
    for (const key of keys) {
      sortedObject[key] = deepSort(data[key]);
    }
    return sortedObject;
  }

  return data;
}
