// Day 5: Check which ingredients fall within "fresh" ID ranges.
// Strategy: Part 1 - count ingredients in any range.
// Part 2 - merge overlapping ranges, count total unique fresh IDs.
import myInput from "./input.ts";

const ranges = myInput
  .split("\n")
  .filter((line) => line.includes("-"))
  .map((line) => {
    const [start, end] = line.split("-").map(Number);
    return [start, end];
  });

const ingredients = myInput
  .split("\n")
  .filter((line) => !line.includes("-") && line.trim() !== "")
  .map(Number);

const isIngredientFresh = (ingredient: number): boolean => {
  for (const [start, end] of ranges) {
    if (ingredient >= start && ingredient <= end) {
      return true;
    }
  }
  return false;
};

let freshCount = 0;
ingredients.forEach((ingredient) => {
  if (isIngredientFresh(ingredient)) {
    freshCount++;
  }
});

console.log(`Number of fresh ingredients: ${freshCount}`);

// Sort ranges by start value
const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);

// Merge overlapping ranges
const mergedRanges: number[][] = [];
for (const [start, end] of sortedRanges) {
  if (mergedRanges.length === 0) {
    mergedRanges.push([start, end]);
  } else {
    const last = mergedRanges[mergedRanges.length - 1];
    // If current range overlaps or is adjacent to last, merge them
    if (start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      mergedRanges.push([start, end]);
    }
  }
}

// Count total unique IDs by summing the size of each merged range
let numberOfFreshIds = 0;
for (const [start, end] of mergedRanges) {
  numberOfFreshIds += end - start + 1;
}
console.log(`Total number of fresh ingredient IDs: ${numberOfFreshIds}`);
