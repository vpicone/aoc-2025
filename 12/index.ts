/**
 * Advent of Code - Day 12: Christmas Tree Farm
 *
 * PROBLEM SUMMARY:
 * Given a set of irregular shapes (presents) and rectangular regions (under trees),
 * determine how many regions can fit all their required presents without overlap.
 * Presents can be rotated and flipped. This is a polyomino packing problem.
 *
 * SOLUTION APPROACH:
 * We use Knuth's Dancing Links (DLX) algorithm to solve this as an exact cover problem.
 *
 * EXACT COVER FORMULATION:
 * - Primary columns: One per piece instance (each piece must be placed exactly once)
 * - Secondary columns: One per grid cell (each cell can be covered at most once)
 *
 * Each row in the DLX matrix represents placing a specific piece variant (rotation/flip)
 * at a specific position. The DLX algorithm efficiently finds if any valid arrangement exists.
 *
 * OPTIMIZATIONS:
 * 1. Early pruning: Reject regions where total piece cells exceed grid size
 * 2. Variant caching: Pre-compute all rotations/flips per shape
 * 3. Placement caching: Pre-compute all valid placements per shape/grid-size
 * 4. Batch constraints: Use addSparseConstraints for better performance
 * 5. Generator interface: Stop as soon as one solution is found
 *
 * Uses the 'dancing-links' npm package - the fastest JS DLX implementation.
 */

// cspell:disable
import { DancingLinks } from "dancing-links";
import input from "./input.ts";

// const input = `0:
// ###
// ##.
// ##.

// 1:
// ###
// ##.
// .##

// 2:
// .##
// ###
// ##.

// 3:
// ##.
// ###
// ##.

// 4:
// ###
// #..
// ###

// 5:
// ###
// .#.
// ###

// 4x4: 0 0 0 0 2 0
// 12x5: 1 0 1 0 2 2
// 12x5: 1 0 1 0 3 2`;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Pentomino = {
  id: number;
  height: number;
  width: number;
  matrix: number[]; // Flattened 2D grid: 1 = filled, 0 = empty
};

type Region = {
  width: number;
  height: number;
  pieces: number[]; // Count of each shape needed (indexed by shape id)
};

// ============================================================================
// INPUT PARSING
// ============================================================================

/**
 * Parse shape definitions from input.
 * Format: "N:" followed by 3 lines of ###/... patterns
 */
const parseShapes = (input: string): Pentomino[] => {
  const split = input.split("\n").filter(Boolean);
  const pentominos: Pentomino[] = [];

  split.forEach((line, index) => {
    if (line.length === 2 && line.includes(":")) {
      pentominos.push({
        id: Number(line[0]),
        height: 3,
        width: 3,
        matrix: (split[index + 1] + split[index + 2] + split[index + 3])
          .replaceAll(".", "0")
          .replaceAll("#", "1")
          .split("")
          .map(Number),
      });
    }
  });

  return pentominos;
};

/**
 * Parse region definitions from input.
 * Format: "WxH: n0 n1 n2 n3 n4 n5" where nX is count of shape X needed
 */
function parseRegions(input: string): Region[] {
  const lines = input.split("\n");
  const regions: Region[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)x(\d+):\s*(.+)$/);
    if (match) {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      const pieces = match[3].split(/\s+/).map(Number);
      regions.push({ width, height, pieces });
    }
  }

  return regions;
}

// ============================================================================
// SHAPE TRANSFORMATIONS (Rotations & Flips)
// ============================================================================

/**
 * Generate all unique orientations of a shape (up to 8: 4 rotations × 2 flips).
 * Returns normalized 2D grids with empty rows/columns removed.
 */
function getVariants(shape: Pentomino): number[][][] {
  // Convert flat matrix to 2D grid
  const toGrid = (
    matrix: number[],
    width: number,
    height: number
  ): number[][] => {
    const grid: number[][] = [];
    for (let y = 0; y < height; y++) {
      grid.push(matrix.slice(y * width, (y + 1) * width));
    }
    return grid;
  };

  // Rotate 90 degrees clockwise
  const rotate = (grid: number[][]): number[][] => {
    const h = grid.length;
    const w = grid[0].length;
    const result: number[][] = [];
    for (let x = 0; x < w; x++) {
      const row: number[] = [];
      for (let y = h - 1; y >= 0; y--) {
        row.push(grid[y][x]);
      }
      result.push(row);
    }
    return result;
  };

  // Flip horizontally
  const flip = (grid: number[][]): number[][] => {
    return grid.map((row) => [...row].reverse());
  };

  // Normalize: remove empty rows/cols and convert to string for dedup
  const normalize = (grid: number[][]): number[][] => {
    // Remove empty rows
    let filtered = grid.filter((row) => row.some((c) => c === 1));
    if (filtered.length === 0) return [[]];

    // Find bounds
    let minCol = Infinity,
      maxCol = -Infinity;
    for (const row of filtered) {
      for (let c = 0; c < row.length; c++) {
        if (row[c] === 1) {
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    // Extract bounded region
    return filtered.map((row) => row.slice(minCol, maxCol + 1));
  };

  const gridToKey = (grid: number[][]): string =>
    grid.map((row) => row.join("")).join("|");

  const seen = new Set<string>();
  const variants: number[][][] = [];

  let current = toGrid(shape.matrix, shape.width, shape.height);

  // Generate 4 rotations
  for (let r = 0; r < 4; r++) {
    const norm = normalize(current);
    const key = gridToKey(norm);
    if (!seen.has(key)) {
      seen.add(key);
      variants.push(norm);
    }

    // Also try flipped version
    const flipped = flip(current);
    const normFlipped = normalize(flipped);
    const keyFlipped = gridToKey(normFlipped);
    if (!seen.has(keyFlipped)) {
      seen.add(keyFlipped);
      variants.push(normFlipped);
    }

    current = rotate(current);
  }

  return variants;
}

// Cache for shape variants - computed once per shape
const variantCache = new Map<number, number[][][]>();

function getCachedVariants(shape: Pentomino): number[][][] {
  if (!variantCache.has(shape.id)) {
    variantCache.set(shape.id, getVariants(shape));
  }
  return variantCache.get(shape.id)!;
}

// Pre-compute all placements for a shape at a given grid size
// Returns array of cell indices for each valid placement
type PlacementCache = Map<string, number[][]>; // key: "shapeId_width_height"
const placementCache: PlacementCache = new Map();

function getShapePlacements(
  shape: Pentomino,
  gridWidth: number,
  gridHeight: number
): number[][] {
  const key = `${shape.id}_${gridWidth}_${gridHeight}`;
  if (placementCache.has(key)) {
    return placementCache.get(key)!;
  }

  const placements: number[][] = [];
  const variants = getCachedVariants(shape);

  for (const variant of variants) {
    const variantHeight = variant.length;
    const variantWidth = variant[0]?.length || 0;

    for (let py = 0; py <= gridHeight - variantHeight; py++) {
      for (let px = 0; px <= gridWidth - variantWidth; px++) {
        const cells: number[] = [];
        for (let y = 0; y < variantHeight; y++) {
          for (let x = 0; x < variantWidth; x++) {
            if (variant[y][x] === 1) {
              cells.push((py + y) * gridWidth + (px + x));
            }
          }
        }
        placements.push(cells);
      }
    }
  }

  placementCache.set(key, placements);
  return placements;
}

// Reuse DancingLinks instance
const dlx = new DancingLinks<null>();

// Pre-compute cell count per shape
const shapeCellCounts = new Map<number, number>();

function getShapeCellCount(shape: Pentomino): number {
  if (!shapeCellCounts.has(shape.id)) {
    shapeCellCounts.set(
      shape.id,
      shape.matrix.filter((c) => c === 1).length
    );
  }
  return shapeCellCounts.get(shape.id)!;
}

// Solve a single region using DLX
function canFitRegion(region: Region, shapes: Pentomino[]): boolean {
  const { width, height, pieces } = region;
  const numCells = width * height;

  // Early pruning: check if total cells needed exceeds grid size
  let totalCellsNeeded = 0;
  for (let shapeIdx = 0; shapeIdx < pieces.length; shapeIdx++) {
    if (pieces[shapeIdx] > 0) {
      totalCellsNeeded += pieces[shapeIdx] * getShapeCellCount(shapes[shapeIdx]);
    }
  }
  if (totalCellsNeeded > numCells) return false;

  // Build list of piece instances we need to place
  const pieceInstances: number[] = []; // just shape indices
  for (let shapeIdx = 0; shapeIdx < pieces.length; shapeIdx++) {
    for (let inst = 0; inst < pieces[shapeIdx]; inst++) {
      pieceInstances.push(shapeIdx);
    }
  }

  if (pieceInstances.length === 0) return true;

  const numPieces = pieceInstances.length;

  const solver = dlx.createSolver({
    primaryColumns: numPieces,
    secondaryColumns: numCells,
  });

  // Build all constraints in batch for better performance
  const constraints: Array<{
    data: null;
    columnIndices: { primary: number[]; secondary: number[] };
  }> = [];

  for (let pieceIdx = 0; pieceIdx < numPieces; pieceIdx++) {
    const shapeIdx = pieceInstances[pieceIdx];
    const placements = getShapePlacements(shapes[shapeIdx], width, height);

    for (const cells of placements) {
      constraints.push({
        data: null,
        columnIndices: {
          primary: [pieceIdx],
          secondary: cells,
        },
      });
    }
  }

  solver.addSparseConstraints(constraints);

  // Use generator for early termination
  const generator = solver.createGenerator();
  const result = generator.next();
  return !result.done;
}

// Main
const shapes = parseShapes(input);
const regions = parseRegions(input);

let count = 0;
for (const region of regions) {
  if (canFitRegion(region, shapes)) {
    count++;
  }
}

console.log("Regions that can fit all presents:", count);
