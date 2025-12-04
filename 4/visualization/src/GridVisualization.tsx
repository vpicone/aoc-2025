import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import input from "./input.ts";

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

type CellState = "active" | "removing" | "empty";

interface Cell {
  state: CellState;
  removeTime: number;
}

export function GridVisualization({ restartKey }: { restartKey: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowMeshRef = useRef<THREE.InstancedMesh>(null);

  const initialMatrix = useMemo(() => {
    return input.split("\n").map((line) => line.split(""));
  }, []);

  const rows = initialMatrix.length;
  const cols = initialMatrix[0]?.length || 0;

  const createInitialGrid = useCallback(() => {
    return initialMatrix.map((row) =>
      row.map((cell) => ({
        state: cell === "@" ? ("active" as const) : ("empty" as const),
        removeTime: 0,
      }))
    );
  }, [initialMatrix]);

  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid);
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [, setRemovedCount] = useState(0);

  // Reset when restartKey changes
  useEffect(() => {
    setGrid(createInitialGrid());
    setStep(0);
    setIsComplete(false);
    setRemovedCount(0);
  }, [restartKey, createInitialGrid]);

  const checkPosition = useCallback(
    (gridState: Cell[][], row: number, col: number): boolean => {
      const neighborCount = directions.filter(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        return (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          gridState[newRow][newCol].state === "active"
        );
      }).length;
      return neighborCount < 4;
    },
    [rows, cols]
  );

  useEffect(() => {
    if (isComplete) return;

    const timer = setTimeout(() => {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
        let changed = false;
        let newRemovedCount = 0;
        const currentTime = Date.now();

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (
              prevGrid[row][col].state === "active" &&
              checkPosition(prevGrid, row, col)
            ) {
              newGrid[row][col].state = "removing";
              newGrid[row][col].removeTime = currentTime;
              changed = true;
              newRemovedCount++;
            }
          }
        }

        if (changed) {
          setStep((s) => s + 1);
          setRemovedCount((c) => c + newRemovedCount);
        } else {
          setIsComplete(true);
        }

        return newGrid;
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [step, isComplete, checkPosition, rows, cols]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prevGrid) =>
        prevGrid.map((row) =>
          row.map((cell) => {
            if (
              cell.state === "removing" &&
              Date.now() - cell.removeTime > 800
            ) {
              return { ...cell, state: "empty" as const };
            }
            return cell;
          })
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(
    () => new Float32Array(rows * cols * 3),
    [rows, cols]
  );
  const glowColorArray = useMemo(
    () => new Float32Array(rows * cols * 3),
    [rows, cols]
  );

  const activeColor = useMemo(() => new THREE.Color("#00ffaa"), []);
  const removingColor = useMemo(() => new THREE.Color("#ff3366"), []);
  const glowColor = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((state) => {
    if (!meshRef.current || !glowMeshRef.current) return;

    const time = state.clock.getElapsedTime();
    const centerX = cols / 2;
    const centerZ = rows / 2;

    let idx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col];
        const x = col - centerX;
        const z = row - centerZ;

        if (cell.state === "empty") {
          dummy.position.set(x, -100, z);
          dummy.scale.set(0, 0, 0);
        } else if (cell.state === "removing") {
          const elapsed = (Date.now() - cell.removeTime) / 1000;
          const progress = Math.min(elapsed / 0.8, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          const height = 2 + Math.sin(time * 3 + col * 0.1 + row * 0.1) * 0.3;
          const y = height * (1 - eased) + eased * (10 + Math.random() * 5);
          const scale = Math.max(0, 1 - eased);

          dummy.position.set(x, y, z);
          dummy.scale.set(scale, scale * (1 + eased * 2), scale);
          dummy.rotation.x = eased * Math.PI * 2;
          dummy.rotation.z = eased * Math.PI;

          const t = eased;
          colorArray[idx * 3] =
            activeColor.r * (1 - t) + removingColor.r * t + Math.random() * 0.2;
          colorArray[idx * 3 + 1] =
            activeColor.g * (1 - t) + removingColor.g * t;
          colorArray[idx * 3 + 2] =
            activeColor.b * (1 - t) + removingColor.b * t;

          glowColorArray[idx * 3] = removingColor.r * (1 - eased);
          glowColorArray[idx * 3 + 1] = removingColor.g * (1 - eased);
          glowColorArray[idx * 3 + 2] = removingColor.b * (1 - eased);
        } else {
          const wave =
            Math.sin(time * 2 + col * 0.08) * Math.cos(time * 1.5 + row * 0.08);
          const height = 2 + wave * 0.5;
          const pulse = 0.9 + Math.sin(time * 4 + (col + row) * 0.1) * 0.1;

          dummy.position.set(x, height, z);
          dummy.scale.set(0.4 * pulse, 0.8 + wave * 0.2, 0.4 * pulse);
          dummy.rotation.set(0, 0, 0);

          const hueShift = Math.sin(time * 0.5 + col * 0.02 + row * 0.02) * 0.1;
          colorArray[idx * 3] = activeColor.r + hueShift;
          colorArray[idx * 3 + 1] = activeColor.g;
          colorArray[idx * 3 + 2] = activeColor.b - hueShift * 0.5;

          glowColorArray[idx * 3] = glowColor.r * 0.3;
          glowColorArray[idx * 3 + 1] = glowColor.g * 0.5;
          glowColorArray[idx * 3 + 2] = glowColor.b * 0.3;
        }

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);
        glowMeshRef.current.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    glowMeshRef.current.instanceMatrix.needsUpdate = true;

    const colorAttr = meshRef.current.geometry.getAttribute("color");
    if (colorAttr) {
      (colorAttr.array as Float32Array).set(colorArray);
      colorAttr.needsUpdate = true;
    }

    const glowColorAttr = glowMeshRef.current.geometry.getAttribute("color");
    if (glowColorAttr) {
      (glowColorAttr.array as Float32Array).set(glowColorArray);
      glowColorAttr.needsUpdate = true;
    }
  });

  const totalCells = rows * cols;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalCells]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, 1, 0.8]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colorArray, 3]}
          />
        </boxGeometry>
        <meshStandardMaterial
          vertexColors
          metalness={0.8}
          roughness={0.2}
          emissive="#004422"
          emissiveIntensity={0.5}
        />
      </instancedMesh>

      <instancedMesh
        ref={glowMeshRef}
        args={[undefined, undefined, totalCells]}
      >
        <sphereGeometry args={[0.6, 8, 8]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[glowColorArray, 3]}
          />
        </sphereGeometry>
        <meshBasicMaterial vertexColors transparent opacity={0.3} />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[cols + 20, rows + 20]} />
        <meshStandardMaterial
          color="#080818"
          metalness={0.9}
          roughness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      <gridHelper
        args={[
          Math.max(rows, cols) + 10,
          Math.max(rows, cols) + 10,
          "#1a1a3a",
          "#0a0a2a",
        ]}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}
