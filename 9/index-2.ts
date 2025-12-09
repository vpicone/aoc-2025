/**
 * Advent of Code - Day 9, Part 2: Movie Theater Tiles
 *
 * PROBLEM SUMMARY:
 * - We have a list of "red" tile coordinates that form vertices of a closed polygon
 * - Consecutive red tiles are connected by straight lines of "green" tiles
 * - The interior of this polygon is also filled with green tiles
 * - Goal: Find the largest rectangle where:
 *   1. Two opposite corners are red tiles
 *   2. ALL tiles within the rectangle are red or green (inside/on the polygon)
 *
 * APPROACH:
 * Since the grid is huge (~98,000 x 98,000), we can't create an actual grid.
 * Instead, we work with the polygon geometry directly:
 *
 * 1. Build the polygon from the list of red tile vertices
 * 2. For each pair of red tiles (potential rectangle corners):
 *    - Check if the entire rectangle stays inside the polygon
 * 3. Track the largest valid rectangle area
 *
 * KEY INSIGHT FOR EFFICIENCY:
 * We don't need to check every single row of a rectangle. The inside/outside
 * status can only change at y-coordinates where polygon vertices exist.
 * So we only check at those "critical" y-values.
 */

import input from "./input.ts";
// const input = `7,1
// 11,1
// 11,7
// 9,7
// 9,5
// 2,5
// 2,3
// 7,3`;

type Tile = { x: number; y: number };
type Segment = { start: Tile; end: Tile; isHorizontal: boolean };

// =============================================================================
// STEP 1: Parse input into tile coordinates
// =============================================================================

const tiles: Tile[] = input.split("\n").map((row) => {
  const [x, y] = row.split(",").map(Number);
  return { x, y };
});

// =============================================================================
// STEP 2: Build polygon edges (segments between consecutive red tiles)
// The polygon wraps around - last tile connects back to first tile
// =============================================================================

const segments: Segment[] = [];
for (let i = 0; i < tiles.length; i++) {
  const current = tiles[i];
  const next = tiles[(i + 1) % tiles.length];
  segments.push({
    start: current,
    end: next,
    isHorizontal: current.y === next.y,
  });
}

// =============================================================================
// STEP 3: Point-in-polygon utilities
// =============================================================================

/**
 * Ray casting algorithm to check if a point is strictly inside the polygon.
 * Cast a horizontal ray to the right from the point and count how many
 * vertical polygon edges it crosses. Odd = inside, Even = outside.
 *
 * Note: Uses half-open interval [minY, maxY) to handle edge cases correctly
 * and avoid double-counting at vertices.
 */
const isPointInside = (x: number, y: number): boolean => {
  let crossings = 0;

  for (const seg of segments) {
    if (seg.isHorizontal) continue;

    const segX = seg.start.x;
    const minY = Math.min(seg.start.y, seg.end.y);
    const maxY = Math.max(seg.start.y, seg.end.y);

    // Count crossing if: segment is to the right AND y is in range [minY, maxY)
    if (segX > x && y >= minY && y < maxY) {
      crossings++;
    }
  }

  return crossings % 2 === 1;
};

/**
 * Check if a point lies exactly on the polygon boundary (on any edge).
 * This handles both horizontal and vertical segments.
 */
const isPointOnBoundary = (x: number, y: number): boolean => {
  for (const seg of segments) {
    if (seg.isHorizontal) {
      const segY = seg.start.y;
      const minX = Math.min(seg.start.x, seg.end.x);
      const maxX = Math.max(seg.start.x, seg.end.x);
      if (y === segY && x >= minX && x <= maxX) return true;
    } else {
      const segX = seg.start.x;
      const minY = Math.min(seg.start.y, seg.end.y);
      const maxY = Math.max(seg.start.y, seg.end.y);
      if (x === segX && y >= minY && y <= maxY) return true;
    }
  }
  return false;
};

/**
 * A point is valid if it's inside the polygon OR on the boundary.
 * Both red tiles (vertices) and green tiles (edges + interior) are valid.
 */
const isPointInsideOrOnBoundary = (x: number, y: number): boolean => {
  return isPointInside(x, y) || isPointOnBoundary(x, y);
};

// =============================================================================
// STEP 4: Line validation - check if a horizontal line stays inside polygon
// =============================================================================

/**
 * Check if a horizontal line from (x1, y) to (x2, y) stays entirely within
 * the polygon (inside or on boundary).
 *
 * Two conditions must be met:
 * 1. The line must not cross through the INTERIOR of any vertical polygon edge
 *    (crossing at an endpoint is OK - that's touching the boundary)
 * 2. Both endpoints must be inside or on the boundary
 */
const isHorizontalLineInside = (x1: number, x2: number, y: number): boolean => {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  // Check for crossings through interior of vertical edges
  for (const seg of segments) {
    if (seg.isHorizontal) continue;

    const segX = seg.start.x;
    const minY = Math.min(seg.start.y, seg.end.y);
    const maxY = Math.max(seg.start.y, seg.end.y);

    // IMPORTANT: Use strict inequalities (y > minY && y < maxY)
    // This means we only reject if the line passes through the INTERIOR
    // of the vertical edge. Touching at an endpoint (y === minY or y === maxY)
    // is allowed because that's on the polygon boundary.
    if (segX > minX && segX < maxX && y > minY && y < maxY) {
      return false;
    }
  }

  // Verify both endpoints are inside or on boundary
  return (
    isPointInsideOrOnBoundary(minX, y) && isPointInsideOrOnBoundary(maxX, y)
  );
};

// =============================================================================
// STEP 5: Rectangle validation
// =============================================================================

// Pre-compute all unique y-values where polygon vertices exist (sorted)
// These are the only y-coordinates where inside/outside status can change
const allYValues = [...new Set(tiles.map((t) => t.y))].sort((a, b) => a - b);

/**
 * Check if a rectangle with opposite corners at tileA and tileB is valid.
 * A rectangle is valid if every point inside it is within the polygon.
 *
 * OPTIMIZATION: Instead of checking every row (could be 98,000+ rows),
 * we only check at "critical" y-values:
 * - The rectangle's top and bottom edges
 * - Any y-coordinate where a polygon vertex exists (inside the rectangle)
 *
 * This works because the polygon is rectilinear (axis-aligned edges only),
 * so the inside/outside status of a horizontal line can only change at
 * y-coordinates where vertical edges start or end.
 */
const isValidRectangle = (tileA: Tile, tileB: Tile): boolean => {
  const minRectX = Math.min(tileA.x, tileB.x);
  const maxRectX = Math.max(tileA.x, tileB.x);
  const minRectY = Math.min(tileA.y, tileB.y);
  const maxRectY = Math.max(tileA.y, tileB.y);

  // Collect critical y-values: rectangle boundaries + polygon vertices in range
  const criticalYs: number[] = [minRectY, maxRectY];
  for (const y of allYValues) {
    if (y > minRectY && y < maxRectY) {
      criticalYs.push(y);
    }
  }

  // Check each critical horizontal line
  for (const y of criticalYs) {
    if (!isHorizontalLineInside(minRectX, maxRectX, y)) {
      return false;
    }
  }

  return true;
};

// =============================================================================
// STEP 6: Find the largest valid rectangle
// =============================================================================

/**
 * Calculate the area of a rectangle with opposite corners at tileA and tileB.
 * Area = width * height, where dimensions are inclusive (+1 for tile counting).
 */
const calculateArea = (tileA: Tile, tileB: Tile): number => {
  const width = Math.abs(tileA.x - tileB.x) + 1;
  const height = Math.abs(tileA.y - tileB.y) + 1;
  return width * height;
};

// Try all pairs of red tiles as potential opposite corners
let largestArea = 0;
for (let i = 0; i < tiles.length; i++) {
  for (let j = i + 1; j < tiles.length; j++) {
    if (isValidRectangle(tiles[i], tiles[j])) {
      const area = calculateArea(tiles[i], tiles[j]);
      if (area > largestArea) {
        largestArea = area;
      }
    }
  }
}

console.log("Part 2:", largestArea);
