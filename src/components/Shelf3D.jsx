import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Single floating card in the 3D shelf
// ---------------------------------------------------------------------------
function ShelfCard({ deal, position, index, onSelect, mouseRef }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Load cover texture — fall back to a generated placeholder if missing
  const thumbUrl = deal.thumb || `https://placehold.co/200x112/1B1E27/E8B84B?text=${encodeURIComponent(deal.title?.slice(0, 12) || 'Game')}`

  // useTexture must be used inside Canvas; errors handled by ErrorBoundary
  const texture = useTexture(thumbUrl)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Gentle idle float
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6 + index * 0.9) * 0.08

    // Parallax tilt from mouse
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const targetRotX = -my * 0.18 + (hovered ? -0.1 : 0)
    const targetRotY = mx * 0.22 + (hovered ? 0.15 : 0)

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05)

    // Scale pop on hover
    const targetScale = hovered ? 1.08 : 1
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1))
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(deal)}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        {/* Card plane */}
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Gold border frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.68, 0.98]} />
        <meshStandardMaterial
          color={hovered ? '#E8B84B' : '#2E3340'}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Price badge */}
      <Text
        position={[0.5, -0.38, 0.01]}
        fontSize={0.13}
        color="#E8B84B"
        font={undefined}
        anchorX="right"
        anchorY="bottom"
      >
        ${Number(deal.salePrice).toFixed(2)}
      </Text>

      {/* Discount badge */}
      {deal.savings > 0.5 && (
        <Text
          position={[-0.5, 0.35, 0.01]}
          fontSize={0.11}
          color="#4CD97D"
          anchorX="left"
          anchorY="top"
        >
          -{Math.round(deal.savings)}%
        </Text>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// The full shelf scene — arranges cards in a slight arc
// ---------------------------------------------------------------------------
function ShelfScene({ deals, onSelect }) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const count = Math.min(deals.length, 7)
  const spread = Math.min(viewport.width * 0.85, 10)

  return (
    <>
      <ambientLight intensity={0.4} color="#12141B" />
      <directionalLight position={[3, 5, 5]} intensity={1.2} color="#E8B84B" />
      <directionalLight position={[-3, 2, 3]} intensity={0.5} color="#35C9C1" />
      <fog attach="fog" args={['#12141B', 8, 20]} />
      <Environment preset="night" />

      {deals.slice(0, count).map((deal, i) => {
        // Arc layout
        const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
        const x = t * (spread / 2)
        const z = -Math.abs(t) * 0.8
        const rotY = -t * 0.25

        return (
          <group key={deal.dealID} rotation={[0, rotY, 0]}>
            <ShelfCard
              deal={deal}
              position={[x, 0, z]}
              index={i}
              onSelect={onSelect}
              mouseRef={mouseRef}
            />
          </group>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Error boundary so a texture 404 doesn't crash the whole shelf
// ---------------------------------------------------------------------------
import { Component } from 'react'
class ShelfErrorBoundary extends Component {
  state = { errored: false }
  static getDerivedStateFromError() { return { errored: true } }
  render() {
    if (this.state.errored) return this.props.fallback
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Public export — includes reduced-motion guard and lazy-friendly structure
// ---------------------------------------------------------------------------
export default function Shelf3D({ deals, onSelect }) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion || !deals?.length) return null

  return (
    <ShelfErrorBoundary fallback={null}>
      <div
        style={{
          width: '100%',
          height: 260,
          borderRadius: 12,
          overflow: 'hidden',
          background: 'var(--ink)',
          position: 'relative',
          cursor: 'default',
        }}
      >
        {/* Gradient fade top/bottom */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, var(--ink) 0%, transparent 18%, transparent 82%, var(--ink) 100%)',
        }} />

        <Canvas
          camera={{ position: [0, 0.2, 5.5], fov: 45 }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ShelfScene deals={deals} onSelect={onSelect} />
          </Suspense>
        </Canvas>

        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          textAlign: 'center', zIndex: 2, pointerEvents: 'none',
          fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--text-muted)', letterSpacing: '0.06em',
        }}>
          CLICK A CARD TO VIEW DEAL
        </div>
      </div>
    </ShelfErrorBoundary>
  )
}
