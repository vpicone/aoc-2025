import input from "./input.ts";
let position = 50;
let timesAtZero = 0;
input.forEach((value) => {
  const [direction, magnitude] = value;
  let toMove = magnitude;
  if (direction === 1) {
    while (toMove > 0) {
      if (position < 99) {
        position++;
      } else {
        position = 0;
      }
      toMove--;
    }
  }
  if (direction === -1) {
    while (toMove > 0) {
      if (position > 0) {
        position--;
      } else {
        position = 99;
      }
      toMove--;
    }
  }

  if (position === 0) {
    timesAtZero++;
  }
});
console.log(timesAtZero);
