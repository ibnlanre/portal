/**
 * A radix quicksort implementation for sorting strings based on character codes.
 * It sorts strings lexicographically by their characters at a given depth.
 *
 * @param strings The array of strings to sort.
 * @param low The starting index of the subarray to sort.
 * @param high The ending index of the subarray to sort.
 * @param depth The current character position to compare in the strings.
 */
export function sort(
  strings: string[],
  low = 0,
  high = strings.length - 1,
  depth = 0
): void {
  if (low >= high) return;

  let gt = high,
    lt = low;

  const pivot = charAt(strings[low], depth);
  let index = low + 1;

  while (index <= gt) {
    const t = charAt(strings[index], depth);
    if (t < pivot) {
      [strings[lt], strings[index]] = [strings[index], strings[lt]];
      lt++;
      index++;
    } else if (t > pivot) {
      [strings[index], strings[gt]] = [strings[gt], strings[index]];
      gt--;
    } else {
      index++;
    }
  }

  sort(strings, low, lt - 1, depth);
  if (pivot >= 0) sort(strings, lt, gt, depth + 1);
  sort(strings, gt + 1, high, depth);
}

function charAt(str: string, pos: number): number {
  return pos < str.length ? str.charCodeAt(pos) : -1;
}
