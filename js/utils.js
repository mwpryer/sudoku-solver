// Return deep copy of array
export function deepCopyArr(arr) {
  let copy = [];
  for (const el of arr) {
    if (Array.isArray(el)) {
      copy.push(deepCopyArr(el));
    } else {
      copy.push(el);
    }
  }
  return copy;
}

// Check if array only has distinct elements (not including 0)
export function isUniqueArr(arr) {
  const els = [];
  for (const el of arr) {
    if (els.includes(el) && el !== 0) return false;
    els.push(el);
  }
  return true;
}

// Create binary matrix map by evaluating matrix element with fn
export function getMap(fn) {
  const map = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!map[i]) map[i] = [];
      map[i][j] = fn(i, j) ? 1 : 0;
    }
  }
  return map;
}
