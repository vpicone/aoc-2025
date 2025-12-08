import input from "./input.ts";
// const input = `162,817,812
// 57,618,57
// 906,360,560
// 592,479,940
// 352,342,300
// 466,668,158
// 542,29,236
// 431,825,988
// 739,650,466
// 52,470,668
// 216,146,977
// 819,987,18
// 117,168,530
// 805,96,715
// 346,949,466
// 970,615,88
// 941,993,340
// 862,61,35
// 984,92,344
// 425,690,689`;

type Point = [number, number, number];
const ORIGIN = [0, 0, 0] as Point;

const distance = (a: Point, b: Point) => {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;

  return Math.sqrt(
    Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) + Math.pow(az - bz, 2)
  );
};

const points = input
  .split("\n")
  .map((line) => line.split(",").map(Number)) as Point[];

type Connection = { p1: number; p2: number; dist: number };

const allPairDistances: Connection[] = [];

for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    allPairDistances.push({
      p1: i,
      p2: j,
      dist: distance(points[i], points[j]),
    });
  }
}

const sortedDistances = allPairDistances.sort((a, b) => {
  return a.dist - b.dist;
}) as Connection[];

// sortedDistances.forEach(({ p1, p2, dist }, i) => {
//   console.log(`${i} | ${points[p1]} : ${points[p2]} | ${dist}`);
// });

const circuits: Set<number>[] = [];

// sortedDistances.forEach(({ p1, p2 }) => {
//   const circuit1Index = circuits.findIndex((c) => c.has(p1));
//   const circuit2Index = circuits.findIndex((c) => c.has(p2));

//   if (circuit1Index >= 0 && circuit2Index >= 0) {
//     // Both in circuits - merge if different
//     if (circuit1Index !== circuit2Index) {
//       circuits[circuit2Index].forEach((p) => circuits[circuit1Index].add(p));
//       circuits.splice(circuit2Index, 1);
//     }
//     // Same circuit - nothing to do
//   } else if (circuit1Index >= 0) {
//     circuits[circuit1Index].add(p2);
//   } else if (circuit2Index >= 0) {
//     circuits[circuit2Index].add(p1);
//   } else {
//     circuits.push(new Set([p1, p2]));
//   }
// });

// for of allows breaking
for (const sortedDistance of sortedDistances) {
  const { p1, p2 } = sortedDistance;
  const circuit1Index = circuits.findIndex((c) => c.has(p1));
  const circuit2Index = circuits.findIndex((c) => c.has(p2));

  if (circuit1Index >= 0 && circuit2Index >= 0) {
    // Both in circuits - merge if different
    if (circuit1Index !== circuit2Index) {
      circuits[circuit2Index].forEach((p) => circuits[circuit1Index].add(p));
      circuits.splice(circuit2Index, 1);
    }
    // Same circuit - nothing to do
  } else if (circuit1Index >= 0) {
    circuits[circuit1Index].add(p2);
  } else if (circuit2Index >= 0) {
    circuits[circuit2Index].add(p1);
  } else {
    circuits.push(new Set([p1, p2]));
  }

  if (circuits.length === 1 && circuits[0].size === points.length) {
    console.log("Final circuit achieved!");
    console.log(`${points[p1]} | ${points[p2]}`);
    console.log(points[p1][0] * points[p2][0]);
    break;
  }
}

const sizes = circuits.map((circuit) => circuit.size);
const sizesInOrder = sizes.sort((a, b) => b - a);

console.log(
  `three largest: ${sizesInOrder[0] * sizesInOrder[1] * sizesInOrder[2]}`
);
