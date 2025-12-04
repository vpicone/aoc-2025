import mynumbers from "./input.ts";
// const mynumbers = [
//   "987654321111111",
//   "811111111111119",
//   "234234234234278",
//   "818181911112111",
// ];

const findLargestJoltage = (num: string): string => {
  const n = num.length;
  const result: string[] = [];
  let startIndex = 0;

  for (let digitsNeeded = 12; digitsNeeded > 0; digitsNeeded--) {
    const endIndex = n - digitsNeeded;
    let maxDigit = num[startIndex];
    let maxPos = startIndex;

    for (let i = startIndex; i <= endIndex; i++) {
      if (num[i] > maxDigit) {
        maxDigit = num[i];
        maxPos = i;
      }
    }
    result.push(maxDigit);
    startIndex = maxPos + 1;
  }

  return result.join("");
};

let sumOfJoltageRatings = BigInt(0);
mynumbers.forEach((num) => {
  const largestJoltage = findLargestJoltage(num);
  sumOfJoltageRatings += BigInt(largestJoltage);
  console.log(
    `Original number: ${num}, Largest joltage rating: ${largestJoltage}`
  );
});

console.log(`Sum of all highest joltage ratings: ${sumOfJoltageRatings}`);
