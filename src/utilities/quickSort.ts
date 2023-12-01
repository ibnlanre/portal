function swap(ary: any[], a: any, b: any) {
  [ary[a], ary[b]] = [ary[b], ary[a]];
}

function inplace_quicksort_partition(
  ary: any[],
  start: number,
  end: number,
  pivotIndex: number
) {
  var i = start;
  var j = end;
  var pivot = ary[pivotIndex];

  while (true) {
    while (ary[i] < pivot) {
      i++;
    }

    j--;
    while (pivot < ary[j]) {
      j--;
    }

    if (!(i < j)) {
      return i;
    }

    swap(ary, i, j);
    i++;
  }
}

function shell_sort_bound(ary: any[], start: number, end: number) {
  var inc = Math.floor((start + end) / 2);

  while (inc >= start) {
    for (var i = inc; i < end; i++) {
      var t = ary[i];
      var j = i;

      while (j >= inc && ary[j - inc] > t) {
        ary[j] = ary[j - inc];
        j -= inc;
      }

      ary[j] = t;
    }

    inc = Math.floor(inc / 2.2);
  }

  return ary;
}

function insertion_sort(ary: any[]) {
  for (var i = 1, l = ary.length; i < l; i++) {
    var value = ary[i];
    var j = i - 1;

    while (j >= 0 && ary[j] > value) {
      ary[j + 1] = ary[j];
      j--;
    }

    ary[j + 1] = value;
  }

  return ary;
}

function fast_quicksort(ary: any[]) {
  var stack = [];
  var entry = [0, ary.length - 1, 2 * Math.floor(Math.log2(ary.length))];
  stack.push(entry);

  while (stack.length) {
    entry = stack.pop() as number[];
    var start = entry.at(0) as number;
    var end = entry.at(1) as number;
    var depth = entry[2] as number;

    if (depth === 0) {
      ary = shell_sort_bound(ary, start, end);
      continue;
    }

    depth--;
    var pivot = Math.round((start + end) / 2);
    var pivotNewIndex = inplace_quicksort_partition(ary, start, end, pivot);

    if (end - pivotNewIndex > 16) {
      entry = [pivotNewIndex + 1, end, depth];
      stack.push(entry);
    }

    if (pivotNewIndex - start > 16) {
      entry = [start, pivotNewIndex - 1, depth];
      stack.push(entry);
    }
  }

  ary = insertion_sort(ary);
  return ary;
}
