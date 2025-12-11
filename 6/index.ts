// Day 6: Parse a transposed grid of numbers with operators, compute sum of results.
// Strategy: Transpose input matrix, group into chunks by column, apply + or * operator
// to each chunk's numbers, sum all chunk results.

// const input = `123 328  51 64
//  45 64  387 23
//   6 98  215 314
// *   +   *   +  `;

import input from "./input.ts";

const inputMatrix = input.split("\n").map((line) => line.split(""));

const transpose = (matrix: string[][]) => {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
};

const matrix = transpose(inputMatrix);

let currentChunkIndex = 0;
let chunks: string[][][] = [];

matrix.forEach((row) => {
  if (row.some((element) => element !== " ")) {
    if (chunks[currentChunkIndex]) {
      chunks[currentChunkIndex].push(row);
    } else {
      chunks[currentChunkIndex] = [row];
    }
  } else {
    currentChunkIndex++;
  }
});

let sum = 0;

chunks.forEach((chunk) => {
  const operand = chunk[0][4];
  let chunkTotal = operand === "+" ? 0 : 1;
  chunk.forEach((line) => {
    const values = line
      .slice(0, 4)
      .filter((value) => value !== " ")
      .join("");
    if (operand === "+") {
      chunkTotal += Number(values);
    } else {
      chunkTotal *= Number(values);
    }
  });
  sum += chunkTotal;
});

console.log(sum);
