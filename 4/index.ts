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

const checkPosition = (row: number, col: number): boolean => {
  let numberOfRollsAround = 0;
  // top left
  if (matrix[row - 1]?.[col - 1] === "@") {
    numberOfRollsAround++;
  }
  // top middle
  if (matrix[row - 1]?.[col] === "@") {
    numberOfRollsAround++;
  }
  // top right
  if (matrix[row - 1]?.[col + 1] === "@") {
    numberOfRollsAround++;
  }
  // left
  if (matrix[row][col - 1] === "@") {
    numberOfRollsAround++;
  }
  // right
  if (matrix[row][col + 1] === "@") {
    numberOfRollsAround++;
  }
  // bottom left
  if (matrix[row + 1]?.[col - 1] === "@") {
    numberOfRollsAround++;
  }
  // bottom middle
  if (matrix[row + 1]?.[col] === "@") {
    numberOfRollsAround++;
  }
  // bottom right
  if (matrix[row + 1]?.[col + 1] === "@") {
    numberOfRollsAround++;
  }

  return numberOfRollsAround < 4;
};

let previousTotalValid = 0;
let totalValidRolls = 0;
let shouldContinue = true;
while (shouldContinue) {
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
  if (previousTotalValid === totalValidRolls) {
    shouldContinue = false;
  } else {
    previousTotalValid = totalValidRolls;
  }
}

console.log(totalValidRolls);
