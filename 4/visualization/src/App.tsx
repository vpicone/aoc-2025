import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useState, useEffect, useCallback } from "react";
import { GridVisualization } from "./GridVisualization";
import "./App.css";

function App() {
  const [restartKey, setRestartKey] = useState(0);

  const handleRestart = useCallback(() => {
    setRestartKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        handleRestart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRestart]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas
        camera={{ position: [0, 80, 100], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#050510"]} />
        <fog attach="fog" args={["#050510", 80, 250]} />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <GridVisualization restartKey={restartKey} />
        </Suspense>

        <ambientLight intensity={0.1} />
        <pointLight position={[0, 50, 0]} intensity={2} color="#4060ff" />
        <pointLight position={[-50, 30, 50]} intensity={1} color="#ff4080" />
        <pointLight position={[50, 30, -50]} intensity={1} color="#40ffff" />
        <spotLight
          position={[0, 100, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          color="#ffffff"
          castShadow
        />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0005]}
          />
          <Vignette darkness={0.5} offset={0.3} />
        </EffectComposer>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={30}
          maxDistance={200}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      <button
        onClick={handleRestart}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "12px 24px",
          fontSize: 14,
          fontFamily: "monospace",
          fontWeight: "bold",
          color: "#00ffaa",
          background: "rgba(0, 255, 170, 0.1)",
          border: "1px solid #00ffaa",
          borderRadius: 8,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 255, 170, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 255, 170, 0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        RESTART (R)
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        <p>Drag to rotate | Scroll to zoom | Press R to restart</p>
      </div>
    </div>
  );
}

export default App;
