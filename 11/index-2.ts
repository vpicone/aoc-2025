// Part 2: Count paths from "svr" to "out" that visit BOTH "dac" and "fft".
// Strategy: Split into two cases based on visit order, multiply segment counts:
//   case1: svr → dac → fft → out
//   case2: svr → fft → dac → out
// Uses memoization to avoid recalculating paths between the same node pairs.
import input from "./input.ts";
// const input = `svr: aaa bbb
// aaa: fft
// fft: ccc
// bbb: tty
// tty: ccc
// ccc: ddd eee
// ddd: hub
// hub: fff
// eee: dac
// dac: fff
// fff: ggg hhh
// ggg: out
// hhh: out`;

const graph = new Map<string, string[]>();
const memo = new Map<string, number>();

input.split("\n").forEach((line) => {
  const [deviceId, outputs] = line.split(":");
  graph.set(deviceId, outputs.split(" ").filter(Boolean));
});

const countPaths = (startId: string, endId: string) => {
  if (startId === endId) {
    return 1;
  }

  const key = `${startId}->${endId}`;
  if (memo.has(key)) {
    return memo.get(key)!;
  }

  const neighbors = graph.get(startId);

  let total = 0;
  if (neighbors) {
    neighbors.forEach((neighbor) => {
      total += countPaths(neighbor, endId);
    });
  }

  memo.set(key, total);
  return total;
};

// case 1

const case1 =
  countPaths("svr", "dac") *
  countPaths("dac", "fft") *
  countPaths("fft", "out");

const case2 =
  countPaths("svr", "fft") *
  countPaths("fft", "dac") *
  countPaths("dac", "out");

console.log(case1 + case2);
