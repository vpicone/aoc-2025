import input from "./input.ts";
// const input = `.......S.......
// ...............
// .......^.......
// ...............
// ......^.^......
// ...............
// .....^.^.^.....
// ...............
// ....^.^...^....
// ...............
// ...^.^...^.^...
// ...............
// ..^...^.....^..
// ...............
// .^.^.^.^.^...^.
// ...............`;

const rows = input.split("\n");

let pathCounts = new Map<number, number>();
pathCounts.set(rows[0].indexOf("S"), 1);

rows.forEach((row) => {
  const newPathCounts = new Map<number, number>();

  pathCounts.forEach((count, colIndex) => {
    if (row[colIndex] === "^") {
      newPathCounts.set(
        colIndex - 1,
        (newPathCounts.get(colIndex - 1) || 0) + count
      );
      newPathCounts.set(
        colIndex + 1,
        (newPathCounts.get(colIndex + 1) || 0) + count
      );
    } else {
      newPathCounts.set(colIndex, (newPathCounts.get(colIndex) || 0) + count);
    }
  });

  pathCounts = newPathCounts;
});

let totalPaths = 0;
pathCounts.forEach((count) => (totalPaths += count));

console.log(totalPaths);
