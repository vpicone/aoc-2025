import myInput from "./input.ts";
// const myInput = `..@@.@@@@.
// @@@.@.@.@@
// @@@@@.@.@@
// @.@@@@..@.
// @@.@@@@.@@
// .@@@@@@@.@
// .@.@.@.@@@
// @.@@@.@@@@
// .@@@@@@@@.
// @.@.@@@.@.`;

const matrix = myInput.split("\n").map((line) => line.split(""));

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1],
];

const checkPosition = (row: number, col: number): boolean => {
  const neighborCount = directions.filter(
    ([dr, dc]) => matrix[row + dr]?.[col + dc] === "@"
  ).length;
  return neighborCount < 4;
};

let previousTotalValid = 0;
let totalValidRolls = 0;
do {
  previousTotalValid = totalValidRolls;
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === "@") {
        if (checkPosition(row, col)) {
          totalValidRolls++;
          matrix[row][col] = ".";
        }
      }
    }
  }
} while (previousTotalValid !== totalValidRolls);

console.log(totalValidRolls);
