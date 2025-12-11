// Day 9 Part 1: Find the largest rectangle area between any two tile coordinates.
// Strategy: Brute force all pairs of tiles, calculate bounding box area (inclusive).
import input from "./input.ts";
// const input = `7,1
// 11,1
// 11,7
// 9,7
// 9,5
// 2,5
// 2,3
// 7,3`;

type Tile = [number, number];

const tiles = input
  .split("\n")
  .map((row) => row.split(",").map(Number)) as Tile[];

console.log(tiles);

const calculateArea = (tileA: Tile, tileB: Tile) => {
  const x = Math.abs(tileA[0] - tileB[0]) + 1;
  const y = Math.abs(tileA[1] - tileB[1]) + 1;
  const area = x * y;
  return area;
};

let largestArea = 0;

for (let i = 0; i < tiles.length; i++) {
  for (let j = i + 1; j < tiles.length; j++) {
    const area = calculateArea(tiles[i], tiles[j]);
    if (area > largestArea) {
      largestArea = area;
    }
  }
}

console.log(largestArea);
