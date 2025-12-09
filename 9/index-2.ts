// import input from "./input.ts";
const input = `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`;

type Tile = { x: number; y: number };

const tiles: Tile[] = input.split("\n").map((row) => {
  const [x, y] = row.split(",").map(Number);
  return { x, y };
});

const calculateArea = (tileA: Tile, tileB: Tile) => {
  const width = Math.abs(tileA.x - tileB.x) + 1;
  const height = Math.abs(tileA.y - tileB.y) + 1;
  return width * height;
};

let minX = Infinity;
let maxX = 0;
let minY = Infinity;
let maxY = 0;

tiles.forEach((tile) => {
  if (tile.x < minX) minX = tile.x;
  if (tile.x > maxX) maxX = tile.x;
  if (tile.y < minY) minY = tile.y;
  if (tile.y > maxY) maxY = tile.y;
});

let largestArea = 0;

for (let i = 0; i < tiles.length; i++) {
  for (let j = i + 1; j < tiles.length; j++) {
    const area = calculateArea(tiles[i], tiles[j]);
    if (area > largestArea) {
      largestArea = area;
    }
  }
}

const width = maxX + 2;
const height = maxY + 2;

type Grid = string[][];
const grid: Grid = new Array(width)
  .fill(null)
  .map(() => new Array(height).fill("."));

const printGrid = (grid: Grid) => {
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      row += grid[x][y];
    }
    console.log(row);
  }
};

tiles.forEach((tile, i) => {
  grid[tile.x][tile.y] = "#";

  // draw to the next tile
  const nextTile = i < tiles.length - 1 ? tiles[i + 1] : tiles[0];
  if (tile.y === nextTile.y) {
    // horizontally aligned
    for (
      let j = Math.min(tile.x, nextTile.x) + 1;
      j < Math.max(tile.x, nextTile.x);
      j++
    ) {
      grid[j][tile.y] = "X";
    }
  } else {
    // vertically aligned
    for (
      let j = Math.min(tile.y, nextTile.y) + 1;
      j < Math.max(tile.y, nextTile.y);
      j++
    ) {
      grid[tile.x][j] = "X";
    }
  }
});

const visit = (tile: Tile) => {
  if (!grid[tile.x]?.[tile.y]) {
    return;
  }
  if (grid[tile.x][tile.y] === ".") {
    grid[tile.x][tile.y] = "_";
    visit({ x: tile.x + 1, y: tile.y });
    visit({ x: tile.x, y: tile.y + 1 });
  }
};

visit({ x: 0, y: 0 });

const fillGrid = (grid: Grid) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[x][y] === ".") {
        grid[x][y] = "X";
      }
    }
  }
};

fillGrid(grid);
printGrid(grid);

// Check if all tiles in a rectangle are red (#) or green (X)
const isValidRectangle = (tileA: Tile, tileB: Tile): boolean => {
  const minRectX = Math.min(tileA.x, tileB.x);
  const maxRectX = Math.max(tileA.x, tileB.x);
  const minRectY = Math.min(tileA.y, tileB.y);
  const maxRectY = Math.max(tileA.y, tileB.y);

  for (let x = minRectX; x <= maxRectX; x++) {
    for (let y = minRectY; y <= maxRectY; y++) {
      const cell = grid[x][y];
      if (cell !== "#" && cell !== "X") {
        return false;
      }
    }
  }
  return true;
};

largestArea = 0;
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
