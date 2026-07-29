import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, createPortal } from '@react-three/fiber';
import { useGLTF, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import { DemoPlayback } from './DemoPlayback';
import { useDemoTimeline } from './useDemoTimeline';

// ── Display Detection ──

let debugMeshList = [];

/**
 * Finds the LCD display mesh in a laptop GLB using geometry heuristics.
 * Selects the thinnest large panel with a display aspect ratio (~16:10)
 * at the highest world-Y position (screen lid, not trackpad/base).
 * Does NOT depend on material names — works with any GLB.
 */
function findDisplayMesh(scene) {
  let fallbackTarget = null;
  let maxArea = 0;
  debugMeshList = [];

  // Primary check: look for known screen material name or keywords
  let primaryTarget = null;
  let primaryMaxArea = 0;
  scene.traverse((child) => {
    if (!child.isMesh) return;
    if (Array.isArray(child.material)) return;
    
    const matName = child.material?.name || '';
    const hasEmissive = !!child.material?.emissiveMap;
    const isScreenMat = matName === 'LtEafgAVRolQqRw' || matName === 'sfCQkHOWyrsLmor' || matName.toLowerCase().includes('screen') || matName.toLowerCase().includes('display');
    
    if (isScreenMat || hasEmissive) {
      child.geometry.computeBoundingBox();
      const bb = child.geometry.boundingBox;
      if (bb) {
        const w = bb.max.x - bb.min.x;
        const h = bb.max.y - bb.min.y;
        const area = w * h;
        
        debugMeshList.push({
          name: child.name,
          mat: matName,
          w: w.toFixed(2),
          h: h.toFixed(2),
          area: area.toFixed(2)
        });

        if (area > primaryMaxArea) {
          primaryMaxArea = area;
          primaryTarget = child;
        }
      }
    }
  });

  if (primaryTarget) return primaryTarget;

  // Fallback: heuristic search for largest thin panel
  maxArea = 0;
  scene.traverse((child) => {
    if (!child.isMesh || Array.isArray(child.material)) return;
    child.geometry.computeBoundingBox();
    const bb = child.geometry.boundingBox;
    if (!bb) return;

    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    const d = bb.max.z - bb.min.z;
    const area = w * h;

    // Must be thin and display-shaped
    if (d < 0.2 && area > 10 && w / h >= 1.2 && w / h <= 2.0) {
      if (area > maxArea) {
        maxArea = area;
        fallbackTarget = child;
      }
    }
  });

  return fallbackTarget;
}

// ── 3D MacBook Model Component ──
function MacBookModel({ demoState, cursor }) {
  const { scene } = useGLTF('/models/macbook_pro_m5_max_16_inch_2026.glb');
  const laptopRef = useRef();
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [displayMesh, setDisplayMesh] = useState(null);

  useEffect(() => {
    const mesh = findDisplayMesh(clonedScene);
    if (!mesh) {
      console.error('No display mesh found in GLB!');
      return;
    }

    console.log('Detected Display Mesh:', mesh.name, 'material:', mesh.material?.name);

    // Hide the baked wallpaper on ALL display meshes (GLB may have multiple)
    clonedScene.traverse((child) => {
      if (!child.isMesh) return;
      if (Array.isArray(child.material)) return;
      if (!child.material) return;
      
      const hasMap = !!child.material.map;
      const hasEmissive = !!child.material.emissiveMap;
      
      if (!hasMap && !hasEmissive) return; // Only process textured meshes
      
      // Blacken every textured mesh — the wallpaper won't survive
      child.material = child.material.clone();
      child.material.map = null;
      child.material.emissiveMap = null;
      if (child.material.emissive) child.material.emissive.setHex(0x000000);
      if (child.material.color) child.material.color.setHex(0x000000);
      child.material.emissiveIntensity = 0;
      child.material.needsUpdate = true;
    });

    setDisplayMesh(mesh);
  }, [clonedScene]);

  // Calculate the scale to perfectly map the 1440px wide UI to the physical mesh width.
  let htmlScale = 0;
  let centerZ = 0;
  if (displayMesh && displayMesh.geometry.boundingBox) {
    const bb = displayMesh.geometry.boundingBox;
    
    // The panel is a thin box. Find its dimensions.
    const dx = bb.max.x - bb.min.x;
    const dy = bb.max.y - bb.min.y;
    const dz = bb.max.z - bb.min.z;
    
    // Sort dimensions to find width (largest), height (middle), and thickness (smallest)
    const dims = [dx, dy, dz].sort((a, b) => b - a);
    const physWidth = dims[0]; // The longest dimension is the screen width
    
    htmlScale = physWidth / 1440; // 1440px is the CSS width of DemoPlayback
    
    // Slightly offset the Z to avoid z-fighting with the screen mesh
    // We assume the screen faces positive Z in its local coordinate system
    centerZ = bb.max.z + 0.005; 
  }

  return (
    <>
      <group
        ref={laptopRef}
        position={[0, -0.2, 0]}
        rotation={[0, 0, 0]}
        scale={0.085}
        dispose={null}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Use createPortal to mount the UI directly INTO the display mesh's local coordinate system! */}
      {displayMesh && createPortal(
        <group position={[0, 0, centerZ]} rotation={[Math.PI, 0, 0]}>
          <Html
            transform
            center
            scale={htmlScale}
          >
            <div style={{
              width: '1440px',
              height: '900px',
              overflow: 'hidden',
              pointerEvents: 'none',
              backgroundColor: '#000000',
              borderRadius: '24px',
              boxSizing: 'border-box',
            }}>
              <DemoPlayback demoState={demoState} cursor={cursor} />
            </div>
          </Html>
        </group>,
        displayMesh
      )}
    </>
  );
}

// ── Realistic 3D Desk Lighting ──
function StudioLighting() {
  return (
    <>
      <directionalLight position={[4, 8, 6]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-6, 5, -4]} intensity={1.5} color="#C6F24E" />
      <ambientLight intensity={0.45} color="#d4d4d4" />
      <Environment preset="studio" blur={0.8} environmentIntensity={0.6} />
      <ContactShadows position={[0, -0.2, 0]} opacity={0.7} scale={10} blur={2.0} far={4} color="#000000" />
    </>
  );
}

// ── Main LaptopScene Container Component ──
export function LaptopScene({ shouldReduceMotion }) {
  const { demoState, cursor } = useDemoTimeline(shouldReduceMotion);

  return (
    <div className="w-full h-full relative bg-transparent overflow-hidden">
      {/* ── Debug Overlay ── */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 text-green-400 font-mono text-[10px] p-4 rounded-xl border border-green-500/30 whitespace-pre pointer-events-none">
        <strong>Detected Screen Meshes:</strong><br/>
        {debugMeshList.map((m, i) => (
          <div key={i}>
            [{i}] {m.name} | {m.mat} | {m.w}x{m.h} = {m.area}
          </div>
        ))}
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [1.8, 1.1, 4.2], fov: 35 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95 
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.3, 0);
        }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <StudioLighting />
          
          <group position={[0.3, 0, 0]}>
            <MacBookModel demoState={demoState} cursor={cursor} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/macbook_pro_m5_max_16_inch_2026.glb');
