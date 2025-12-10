/**
 * Advent of Code - Day 10: Factory (Part 2)
 *
 * ============================================================================
 * PROBLEM SUMMARY
 * ============================================================================
 *
 * Each machine has:
 * - Counters (starting at 0) that need to reach specific target values
 * - Buttons that increment certain counters by 1 each time pressed
 *
 * Goal: Find the minimum total button presses to make all counters hit their targets.
 *
 * Example: {3,5,4,7} means 4 counters that need to reach values 3, 5, 4, and 7.
 * Button (1,3) increments counters 1 and 3 by 1 each press.
 *
 * ============================================================================
 * WHY THIS IS HARD
 * ============================================================================
 *
 * Unlike Part 1 (where each button is pressed 0 or 1 times), here buttons can
 * be pressed any number of times. With targets up to ~270, we can't brute force
 * all combinations.
 *
 * This is a classic "Integer Linear Programming" (ILP) problem:
 * - We have VARIABLES: how many times to press each button (unknown integers >= 0)
 * - We have CONSTRAINTS: each counter must equal its target
 * - We have an OBJECTIVE: minimize total presses
 *
 * ============================================================================
 * WHAT IS Z3?
 * ============================================================================
 *
 * Z3 is a "theorem prover" / "SMT solver" made by Microsoft Research.
 * Think of it as a super-powered equation solver that can:
 *
 * 1. Handle many variables and constraints simultaneously
 * 2. Find solutions that satisfy ALL constraints
 * 3. Optimize (find the minimum or maximum of something)
 * 4. Work with integers (not just decimals) - crucial for this problem!
 *
 * Instead of us writing complex algorithms to search for solutions,
 * we just DESCRIBE the problem to Z3 and it figures out the answer.
 *
 * ============================================================================
 * HOW WE USE Z3 HERE
 * ============================================================================
 *
 * For a machine with buttons [(0,2), (1,2), (0,1)] and targets {3, 5, 4}:
 *
 * Step 1: Create variables for each button press count
 *   let b0 = ??? (how many times to press button 0)
 *   let b1 = ??? (how many times to press button 1)
 *   let b2 = ??? (how many times to press button 2)
 *
 * Step 2: Add constraints
 *   b0 >= 0, b1 >= 0, b2 >= 0  (can't press negative times)
 *
 *   Counter 0 is affected by buttons 0 and 2: b0 + b2 = 3
 *   Counter 1 is affected by buttons 1 and 2: b1 + b2 = 5
 *   Counter 2 is affected by buttons 0 and 1: b0 + b1 = 4
 *
 * Step 3: Tell Z3 to minimize b0 + b1 + b2
 *
 * Step 4: Z3 solves it! (might find b0=1, b1=2, b2=2 → total 5 presses)
 *
 * ============================================================================
 * Z3 API BASICS (z3-solver npm package)
 * ============================================================================
 *
 * // Initialize Z3 (it's async because it loads WebAssembly)
 * const { Context } = await init();
 * const Z3 = Context("main");
 *
 * // Create an integer variable named "x"
 * const x = Z3.Int.const("x");
 *
 * // Create an optimizer (solver that can minimize/maximize)
 * const solver = new Z3.Optimize();
 *
 * // Add constraints using method chaining:
 * solver.add(x.ge(0));        // x >= 0
 * solver.add(x.le(100));      // x <= 100
 * solver.add(x.eq(42));       // x == 42
 * solver.add(x.add(y).eq(10)); // x + y == 10
 *
 * // Tell it what to minimize
 * solver.minimize(x.add(y));
 *
 * // Solve and check result
 * const result = await solver.check(); // "sat" = satisfiable (solution found)
 * const model = solver.model();
 * const value = Number(model.eval(x).toString()); // Get the actual number
 */

import { init } from "z3-solver";
import realInput from "./input.ts";

const exampleInput = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;

const input = realInput; // Switch to exampleInput for testing

type Machine = {
  buttons: number[][]; // buttons[i] = array of counter indices that button i affects
  targets: number[]; // target value for each counter
};

/**
 * Parse input into machines.
 *
 * Example line: "[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}"
 *
 * We ignore the [.##.] part (that's for Part 1).
 * Buttons: (3) means button affects counter 3
 *          (1,3) means button affects counters 1 and 3
 * Targets: {3,5,4,7} means counters need to reach 3, 5, 4, 7
 */
const machines: Machine[] = input.split("\n").map((line) => {
  // Extract the buttons section: "(3) (1,3) (2)..." → [[3], [1,3], [2], ...]
  const buttonSection = line.slice(line.indexOf("("), line.indexOf("{") - 1);
  const buttons = buttonSection
    .replace(/[()]/g, "") // Remove parentheses
    .split(" ") // Split by space
    .map((button) => button.split(",").map(Number)); // "1,3" → [1, 3]

  // Extract targets: "{3,5,4,7}" → [3, 5, 4, 7]
  const targetMatch = line.match(/\{([^}]+)\}/);
  const targets = targetMatch![1].split(",").map(Number);

  return { buttons, targets };
});

/**
 * Main solving function using Z3.
 */
async function solve() {
  // Initialize Z3 - this loads the WebAssembly module
  const { Context } = await init();
  const Z3 = Context("main");

  let totalPresses = 0;

  for (let machineIdx = 0; machineIdx < machines.length; machineIdx++) {
    const machine = machines[machineIdx];
    const { buttons, targets } = machine;
    const numButtons = buttons.length;
    const numCounters = targets.length;

    // =========================================================================
    // STEP 1: Create a variable for each button
    // =========================================================================
    // buttonVars[i] represents "how many times do we press button i?"
    // We don't know the values yet - Z3 will figure them out!
    const buttonVars = buttons.map((_, i) => Z3.Int.const(`b${i}`));

    // =========================================================================
    // STEP 2: Create an Optimize solver
    // =========================================================================
    // "Optimize" means we want to minimize (or maximize) something
    // A regular "Solver" just finds ANY solution, Optimize finds the BEST one
    const solver = new Z3.Optimize();

    // =========================================================================
    // STEP 3: Add non-negativity constraints
    // =========================================================================
    // Can't press a button a negative number of times!
    // For each button variable, add: buttonVar >= 0
    for (const buttonVar of buttonVars) {
      solver.add(buttonVar.ge(0));
    }

    // =========================================================================
    // STEP 4: Add constraints for each counter reaching its target
    // =========================================================================
    // For each counter, the sum of presses of buttons that affect it
    // must equal the target value.
    //
    // Example: If counter 2 is affected by buttons 0 and 3, and target is 10:
    //          b0 + b3 = 10
    for (let counterIdx = 0; counterIdx < numCounters; counterIdx++) {
      // Find all buttons that affect this counter
      const affectingButtonVars: ReturnType<typeof Z3.Int.const>[] = [];

      for (let buttonIdx = 0; buttonIdx < numButtons; buttonIdx++) {
        // buttons[buttonIdx] is the list of counters this button affects
        if (buttons[buttonIdx].includes(counterIdx)) {
          affectingButtonVars.push(buttonVars[buttonIdx]);
        }
      }

      if (affectingButtonVars.length > 0) {
        // Sum up all the button variables that affect this counter
        // reduce with .add() chains them: b0.add(b3).add(b5)...
        const sum = affectingButtonVars.reduce((acc, v) => acc.add(v));

        // This sum must equal the target for this counter
        solver.add(sum.eq(targets[counterIdx]));
      } else if (targets[counterIdx] !== 0) {
        // No buttons affect this counter, but target isn't 0 - impossible!
        console.log(
          `Machine ${machineIdx + 1}: Impossible (counter ${counterIdx} unreachable)`
        );
        continue;
      }
      // If no buttons affect it and target is 0, that's fine - already satisfied
    }

    // =========================================================================
    // STEP 5: Tell Z3 what to minimize
    // =========================================================================
    // We want the minimum TOTAL button presses: b0 + b1 + b2 + ...
    const totalPressesVar = buttonVars.reduce((acc, v) => acc.add(v));
    solver.minimize(totalPressesVar);

    // =========================================================================
    // STEP 6: Solve!
    // =========================================================================
    // Z3 will now search for values that satisfy all constraints
    // while minimizing the total presses
    const result = await solver.check();

    if (result === "sat") {
      // "sat" = satisfiable = a solution exists!
      // Get the model (the actual values Z3 found)
      const model = solver.model();

      // Extract the numeric value of our total presses
      const total = Number(model.eval(totalPressesVar).toString());

      console.log(`Machine ${machineIdx + 1}: ${total} presses`);
      totalPresses += total;
    } else {
      // "unsat" = unsatisfiable = no solution exists
      // "unknown" = Z3 couldn't determine (rare for simple problems)
      console.log(`Machine ${machineIdx + 1}: No solution (${result})`);
    }
  }

  console.log(`\nTotal: ${totalPresses}`);
}

// Run the async solve function
solve().catch(console.error);
