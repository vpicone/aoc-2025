const input =
  "3737332285-3737422568,5858547751-5858626020,166911-236630,15329757-15423690,753995-801224,1-20,2180484-2259220,24-47,73630108-73867501,4052222-4199117,9226851880-9226945212,7337-24735,555454-591466,7777695646-7777817695,1070-2489,81504542-81618752,2584-6199,8857860-8922218,979959461-980003045,49-128,109907-161935,53514821-53703445,362278-509285,151-286,625491-681593,7715704912-7715863357,29210-60779,3287787-3395869,501-921,979760-1021259"
    .split(",")
    .map((range) => {
      const [start, end] = range.split("-").map(Number);
      return [start, end];
    });

// const input = "11-22".split(",").map((range) => {
//   const [start, end] = range.split("-").map(Number);
//   return [start, end];
// });

let sum = 0;
let invalidIds: Set<number> = new Set();

const compareClusters = (num: number, clusterSize: number) => {
  const str = num.toString();
  const clusters: Set<string> = new Set();
  for (let i = 0; i < str.length; i += clusterSize) {
    clusters.add(str.slice(i, i + clusterSize));
  }
  // console.log(`Number: ${num}, Cluster Size: ${clusterSize}`);
  // console.log(clusters);
  // console.log(clusters.size);
  if (clusters.size === 1) {
    invalidIds.add(num);
    // sum += num;
  }
};

const compareAllPossibleSplits = (num: number) => {
  const str = num.toString();
  for (let i = 1; i <= Math.floor(str.length / 2); i++) {
    compareClusters(num, i);
  }
};

input.forEach(([start, end]) => {
  for (let i = start; i <= end; i++) {
    // const str = i.toString();
    // const firstHalf = str.slice(0, str.length / 2);
    // const secondHalf = str.slice(str.length / 2);
    // if (firstHalf === secondHalf) {
    //   sum += i;
    // }
    compareAllPossibleSplits(i);
  }
});

let summ = 0;
const sumOfInvalidIds = Array.from(invalidIds).forEach((val) => {
  summ += val;
});

console.log(`Sum of all invalid ids: ${summ}`);
console.log(`Number of invalid IDs: ${invalidIds.size}: ${[...invalidIds]}`);
