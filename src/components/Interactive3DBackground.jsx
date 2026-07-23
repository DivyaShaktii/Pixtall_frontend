import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Premium Materials
const materials = {
  gold: new THREE.MeshPhysicalMaterial({ color: '#ffd700', metalness: 1, roughness: 0.1, clearcoat: 1 }),
  silver: new THREE.MeshPhysicalMaterial({ color: '#e0e0e0', metalness: 1, roughness: 0.1 }),
  diamond: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, opacity: 1, roughness: 0, ior: 2.4, thickness: 0.5 }),
  leatherBlack: new THREE.MeshPhysicalMaterial({ color: '#111111', roughness: 0.8, metalness: 0.1 }),
  leatherBrown: new THREE.MeshPhysicalMaterial({ color: '#5c3a21', roughness: 0.7, metalness: 0.1 }),
  lipstickRed: new THREE.MeshPhysicalMaterial({ color: '#cc0000', roughness: 0.3, metalness: 0.1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.9, opacity: 1, roughness: 0.1, ior: 1.5, thickness: 2 }),
  plasticBlack: new THREE.MeshPhysicalMaterial({ color: '#050505', roughness: 0.2, metalness: 0.5, clearcoat: 1 }),
  screen: new THREE.MeshPhysicalMaterial({ color: '#000000', roughness: 0.1, metalness: 0.8, clearcoat: 1 }),
  rubberWhite: new THREE.MeshPhysicalMaterial({ color: '#eeeeee', roughness: 0.9, metalness: 0 }),
  fabricBlue: new THREE.MeshPhysicalMaterial({ color: '#2a4b7c', roughness: 0.9, metalness: 0 })
}

// Procedural Solid 3D Models
function Ring() {
  return (
    <group scale={1.5}>
      <mesh geometry={new THREE.TorusGeometry(0.5, 0.1, 16, 64)} material={materials.gold} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={new THREE.OctahedronGeometry(0.25, 0)} material={materials.diamond} position={[0, 0.5, 0]} />
    </group>
  )
}

function Lipstick() {
  return (
    <group scale={1.2} rotation={[0, 0, 0.2]}>
      {/* Base */}
      <mesh geometry={new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32)} material={materials.gold} position={[0, -0.4, 0]} />
      {/* Tube */}
      <mesh geometry={new THREE.CylinderGeometry(0.25, 0.25, 0.6, 32)} material={materials.plasticBlack} position={[0, 0.3, 0]} />
      {/* Tip */}
      <mesh geometry={new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32)} material={materials.lipstickRed} position={[0, 0.7, 0]} rotation={[0, 0, -0.2]} />
    </group>
  )
}

function Smartphone() {
  return (
    <group scale={1.2}>
      {/* Body */}
      <mesh geometry={new THREE.BoxGeometry(1.2, 2.4, 0.1)} material={materials.silver} />
      {/* Screen */}
      <mesh geometry={new THREE.BoxGeometry(1.1, 2.3, 0.12)} material={materials.screen} position={[0, 0, 0.01]} />
    </group>
  )
}

function Perfume() {
  return (
    <group scale={1.5}>
      {/* Bottle */}
      <mesh geometry={new THREE.BoxGeometry(1, 1, 0.5)} material={materials.glass} />
      {/* Liquid core (approx) */}
      <mesh geometry={new THREE.BoxGeometry(0.8, 0.8, 0.3)} material={new THREE.MeshPhysicalMaterial({ color: '#ffb6c1', transmission: 0.5 })} />
      {/* Cap */}
      <mesh geometry={new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32)} material={materials.gold} position={[0, 0.7, 0]} />
    </group>
  )
}

function Handbag() {
  return (
    <group scale={1.5}>
      {/* Body */}
      <mesh geometry={new THREE.BoxGeometry(1.6, 1.2, 0.6)} material={materials.leatherBlack} />
      {/* Strap / Handle */}
      <mesh geometry={new THREE.TorusGeometry(0.5, 0.05, 16, 32, Math.PI)} material={materials.leatherBlack} position={[0, 0.6, 0]} />
      {/* Gold badge */}
      <mesh geometry={new THREE.BoxGeometry(0.3, 0.2, 0.65)} material={materials.gold} position={[0, 0.2, 0]} />
    </group>
  )
}

function Shoe() {
  return (
    <group scale={1.5}>
      {/* Sole */}
      <mesh geometry={new THREE.BoxGeometry(0.8, 0.2, 2.2)} material={materials.rubberWhite} position={[0, -0.3, 0]} />
      {/* Upper body */}
      <mesh geometry={new THREE.CapsuleGeometry(0.4, 1.2, 16, 32)} material={materials.fabricBlue} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} />
    </group>
  )
}

const MODELS = [Ring, Lipstick, Smartphone, Perfume, Handbag, Shoe]

function SolidParticle({ modelIndex, position, scale, rotX, rotY, rotZ, spinSpeed, driftX, driftY, floatSpeed, floatAmp, timeOffset, depthFactor }) {
  const group = useRef()
  const startPos = useRef(new THREE.Vector3(...position))
  const targetPos = useRef(new THREE.Vector3(...position))
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const Model = MODELS[modelIndex]

  useFrame((state) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    
    // 1. Natural Drift & Bobbing
    startPos.current.x += driftX
    startPos.current.y += driftY
    
    // Wrap around bounds (seamless)
    const boundX = state.viewport.width
    const boundY = state.viewport.height
    if (startPos.current.x > boundX) startPos.current.x = -boundX
    if (startPos.current.x < -boundX) startPos.current.x = boundX
    if (startPos.current.y > boundY) startPos.current.y = -boundY
    if (startPos.current.y < -boundY) startPos.current.y = boundY

    const bobY = Math.sin(time * floatSpeed + timeOffset) * floatAmp
    const bobX = Math.cos(time * (floatSpeed * 0.8) + timeOffset) * (floatAmp * 0.5)
    
    const tp = startPos.current.clone()
    tp.y += bobY
    tp.x += bobX

    // 2. Magnetic Repulsion (Spring based)
    const mouseX = (state.mouse.x * state.viewport.width) / 2
    const mouseY = (state.mouse.y * state.viewport.height) / 2
    const mousePos = new THREE.Vector3(mouseX, mouseY, 0)
    
    const dist = mousePos.distanceTo(group.current.position)
    const repelRadius = 8 * depthFactor
    
    if (dist < repelRadius) {
      const force = new THREE.Vector3().subVectors(group.current.position, mousePos).normalize()
      const strength = Math.pow((repelRadius - dist) / repelRadius, 2) * 1.5 * depthFactor
      tp.add(force.multiplyScalar(strength))
    }

    // 3. Spring Physics
    const tension = 0.02
    const friction = 0.08
    const accel = new THREE.Vector3().subVectors(tp, group.current.position).multiplyScalar(tension)
    velocity.current.add(accel)
    velocity.current.multiplyScalar(1 - friction)
    group.current.position.add(velocity.current)

    // 4. Rotation
    group.current.rotation.x += spinSpeed * 0.5
    group.current.rotation.y += spinSpeed
    group.current.rotation.z += spinSpeed * 0.3
  })

  return (
    <group ref={group} position={position} scale={scale} rotation={[rotX, rotY, rotZ]}>
      <Model />
    </group>
  )
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 2.5 + Math.sin(t * 0.3) * 0.5, 0.02)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 2.5 + Math.cos(t * 0.2) * 0.5, 0.02)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  const { size, viewport } = useThree()
  const isMobile = size.width < 768
  const isTablet = size.width >= 768 && size.width < 1024
  
  let totalObjects = 70 // Safe number for complex procedural geometries
  if (isMobile) totalObjects = 25
  else if (isTablet) totalObjects = 45

  const particles = useMemo(() => {
    const data = []
    for (let i = 0; i < totalObjects; i++) {
      const modelIndex = Math.floor(Math.random() * MODELS.length)
      
      let scaleMult = 1
      const rand = Math.random()
      if (rand > 0.9) scaleMult = 2.0
      else if (rand > 0.7) scaleMult = 1.4
      else if (rand > 0.4) scaleMult = 1.0
      else scaleMult = 0.6
      
      const scale = (0.5 + Math.random() * 0.5) * scaleMult
      
      let x, y
      while (true) {
        x = (Math.random() - 0.5) * (viewport.width * 1.5)
        y = (Math.random() - 0.5) * (viewport.height * 1.5)
        if (Math.abs(x) < 5 && Math.abs(y) < 5) continue
        break
      }
      
      const z = (Math.random() - 0.5) * 35 - 10
      const depthFactor = Math.max(0.1, 1 - Math.abs(z) / 25)
      
      data.push({
        id: i,
        modelIndex,
        position: [x, y, z],
        scale: [scale, scale, scale],
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        spinSpeed: (Math.random() - 0.5) * 0.02,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.5 + Math.random(),
        floatAmp: 0.5 + Math.random() * 1.5,
        timeOffset: Math.random() * 100,
        depthFactor
      })
    }
    return data
  }, [totalObjects, viewport.width, viewport.height])

  return (
    <>
      <CameraRig />
      <Environment preset="city" />
      <ambientLight intensity={1.5} />
      {/* High-end lighting for 3D realism */}
      <directionalLight position={[10, 10, 5]} intensity={3.5} color="#ffffff" castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={2.0} color="#00ffff" />
      <directionalLight position={[0, -10, 10]} intensity={1.5} color="#ff00ff" />
      
      {particles.map(props => (
        <SolidParticle key={props.id} {...props} />
      ))}
      
      {/* Cinematic Post-Processing */}
      <EffectComposer disableNormalPass>
        <DepthOfField target={[0, 0, 0]} focalLength={0.05} bokehScale={6} height={700} />
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
      </EffectComposer>
    </>
  )
}

export default function Interactive3DBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden bg-transparent">
      <Canvas camera={{ position: [0, 0, 18], fov: 45 }} dpr={[1, 2]}>
        <React.Suspense fallback={null}>
          <Scene />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
