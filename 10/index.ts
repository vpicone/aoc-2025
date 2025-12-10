/**
 * Advent of Code - Day 10: Factory
 *
 * PROBLEM SUMMARY:
 * Each machine has indicator lights (on/off) and buttons that toggle specific lights.
 * Goal: Find the minimum number of button presses to match the target light pattern.
 *
 * SOLUTION APPROACH:
 * We use bitmasks to represent light states and button effects as numbers.
 * Then we brute-force all possible combinations of button presses using XOR operations.
 *
 * BITWISE OPERATIONS USED:
 *
 * 1. LEFT SHIFT (<<)
 *    - `1 << n` creates a number with only bit n set (equals 2^n)
 *    - Example: 1 << 3 = 0b1000 = 8
 *
 * 2. BITWISE OR (|=)
 *    - Sets specific bits to 1 without changing others
 *    - Example: 0b0001 |= 0b0100 = 0b0101
 *
 * 3. BITWISE XOR (^=)
 *    - Toggles bits: 0^1=1, 1^1=0, 0^0=0, 1^0=1
 *    - Perfect for light toggling!
 *    - Example: 0b1100 ^= 0b1010 = 0b0110
 *
 * 4. BITWISE AND (&)
 *    - Tests if a specific bit is set
 *    - Example: (0b1010 & 0b0010) = 0b0010 (truthy, so bit 1 is set)
 */

// const input = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
// [...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
// [.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;

import input from "./input.ts";

type Machine = {
  pattern: number; // Target light pattern as a bitmask
  buttons: number[]; // Each button's effect as a bitmask
};

/**
 * Parse input and convert each machine to bitmask representation.
 *
 * Example output:
 * [
 *   { pattern: 6, buttons: [ 8, 10, 4, 12, 5, 3 ] },
 *   ...
 * ]
 *
 * For pattern 6 (binary 0110), lights at positions 1 and 2 should be ON.
 * For button 10 (binary 1010), pressing it toggles lights at positions 1 and 3.
 */
const machines: Machine[] = input.split("\n").map((machine) => {
  /**
   * Convert a light pattern string to a bitmask number.
   *
   * Example: ".##." → 0b0110 = 6
   *   - Position 0: '.' (off) → bit 0 = 0
   *   - Position 1: '#' (on)  → bit 1 = 1
   *   - Position 2: '#' (on)  → bit 2 = 1
   *   - Position 3: '.' (off) → bit 3 = 0
   *
   * BITWISE EXPLANATION:
   *   `1 << i` creates a number with only bit i set.
   *   `result |= (1 << i)` sets bit i in result to 1.
   *
   *   Iteration for ".##.":
   *     i=0: '.' → skip
   *     i=1: '#' → result |= (1 << 1) → result |= 2 → result = 2 (0b0010)
   *     i=2: '#' → result |= (1 << 2) → result |= 4 → result = 6 (0b0110)
   *     i=3: '.' → skip
   *   Final result: 6
   */
  function patternToNumber(pattern: string): number {
    let result = 0;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === "#") {
        result |= 1 << i;
      }
    }
    return result;
  }

  /**
   * Convert button positions array to a bitmask number.
   *
   * Example: [1, 3] → 0b1010 = 10
   *   - Position 1 → bit 1 = 1
   *   - Position 3 → bit 3 = 1
   *
   * BITWISE EXPLANATION:
   *   Same as patternToNumber - we set a bit for each position the button toggles.
   *
   *   Iteration for [1, 3]:
   *     pos=1: result |= (1 << 1) → result |= 2 → result = 2  (0b0010)
   *     pos=3: result |= (1 << 3) → result |= 8 → result = 10 (0b1010)
   *   Final result: 10
   */
  const buttonToNumber = (positions: number[]): number => {
    let result = 0;
    for (const pos of positions) {
      result |= 1 << pos;
    }
    return result;
  };

  // Parse the pattern from "[.##.]" → ".##." → 6
  const pattern = patternToNumber(
    machine.slice(0, machine.indexOf(" ")).replace(/[\[\]]/g, "")
  );

  // Parse buttons from "(3) (1,3) (2)..." → [[3], [1,3], [2]...] → [8, 10, 4...]
  const buttons = machine
    .slice(machine.indexOf("("), machine.indexOf("{") - 1)
    .replace(/[()]/g, "")
    .split(" ")
    .map((button) => button.split(",").map(Number))
    .map(buttonToNumber);

  return { pattern, buttons };
});

/**
 * Find the minimum number of button presses to reach the target light pattern.
 *
 * ALGORITHM:
 * We try every possible combination of button presses using a bitmask.
 * For n buttons, there are 2^n combinations (each button is either pressed or not).
 *
 * BITWISE EXPLANATION:
 *
 * `1 << numButtons` = 2^numButtons = total number of combinations
 *   Example: 3 buttons → 1 << 3 = 8 combinations (0 through 7)
 *
 * Each `mask` value represents a combination:
 *   mask=0 (0b000): press no buttons
 *   mask=1 (0b001): press button 0
 *   mask=2 (0b010): press button 1
 *   mask=3 (0b011): press buttons 0 and 1
 *   mask=4 (0b100): press button 2
 *   mask=5 (0b101): press buttons 0 and 2
 *   mask=6 (0b110): press buttons 1 and 2
 *   mask=7 (0b111): press all buttons
 *
 * `mask & (1 << i)` checks if button i should be pressed in this combination.
 *   Example: Is button 2 pressed in mask=5 (0b101)?
 *     5 & (1 << 2) = 0b101 & 0b100 = 0b100 = 4 (truthy) → YES
 *   Example: Is button 1 pressed in mask=5 (0b101)?
 *     5 & (1 << 1) = 0b101 & 0b010 = 0b000 = 0 (falsy) → NO
 *
 * `lights ^= buttons[i]` toggles all lights affected by button i.
 *   XOR is perfect because:
 *     0 ^ 1 = 1 (light off → turns on)
 *     1 ^ 1 = 0 (light on → turns off)
 *   Example: lights=0b0000, button=0b1010
 *     0b0000 ^= 0b1010 = 0b1010 (lights 1 and 3 now ON)
 */
const minPresses = (machine: Machine): number => {
  const { buttons, pattern: target } = machine;
  const numButtons = buttons.length;
  let minPresses = Infinity;

  // Try every combination from 0 to 2^numButtons - 1
  for (let mask = 0; mask < 1 << numButtons; mask++) {
    let lights = 0; // All lights start off (all bits = 0)
    let presses = 0;

    // Check each button to see if it's pressed in this combination
    for (let i = 0; i < numButtons; i++) {
      // `mask & (1 << i)` is truthy if bit i is set in mask
      if (mask & (1 << i)) {
        // XOR toggles all the lights this button affects
        lights ^= buttons[i];
        presses++;
      }
    }

    // Check if this combination produces the target pattern
    if (lights === target) {
      minPresses = Math.min(minPresses, presses);
    }
  }

  return minPresses;
};

// Sum up the minimum presses for all machines
let totalPresses = 0;
machines.forEach((machine) => {
  totalPresses += minPresses(machine);
});

console.log(totalPresses);
