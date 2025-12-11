// Part 1: Count all paths from "you" to "out" in a directed acyclic graph.
// Strategy: DFS recursion - base case returns 1 at "out", otherwise sum paths from all neighbors.
import input from "./input.ts";
// const input = `aaa: you hhh
// you: bbb ccc
// bbb: ddd eee
// ccc: ddd eee fff
// ddd: ggg
// eee: out
// fff: out
// ggg: out
// hhh: ccc fff iii
// iii: out`;

const graph = new Map<string, string[]>();

input.split("\n").forEach((line) => {
  const [deviceId, outputs] = line.split(":");
  graph.set(deviceId, outputs.split(" ").filter(Boolean));
});

const countPaths = (deviceId: string) => {
  if (deviceId === "out") {
    return 1;
  }

  const neighbors = graph.get(deviceId);

  let total = 0;
  if (neighbors) {
    neighbors.forEach((neighbor) => {
      total += countPaths(neighbor);
    });
  }

  return total;
};

console.log(countPaths("you"));
