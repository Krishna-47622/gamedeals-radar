import { useRef, useState, useCallback } from 'react'

export default function Card3D({
  children,
  className = '',
  style = {},
  onClick,
  maxTilt = 15, // max rotation degrees
  scale = 1.03, // scale on hover
  glare = true,
  disabled = false,
  ...props
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (disabled || !cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left // x position inside element
    const y = e.clientY - rect.top  // y position inside element

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Normalize from -1 to 1
    const normX = (x - centerX) / centerX
    const normY = (y - centerY) / centerY

    // Rotation angles
    const rotX = -normY * maxTilt
    const rotY = normX * maxTilt

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`)

    if (glare) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      const angle = Math.atan2(normY, normX) * (180 / Math.PI) + 90
      
      setGlareStyle({
        opacity: 0.25,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%), linear-gradient(${angle}deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 80%)`,
      })
    }
  }, [disabled, maxTilt, scale, glare])

  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    setIsHovered(true)
  }, [disabled])

  const handleMouseLeave = useCallback(() => {
    if (disabled) return
    setIsHovered(false)
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlareStyle({ opacity: 0 })
  }, [disabled])

  return (
    <div
      ref={cardRef}
      className={`card-3d ${isHovered ? 'card-3d--hovered' : ''} ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          className="card-3d__glare"
          style={{
            ...glareStyle,
            transition: isHovered ? 'opacity 0.2s ease' : 'opacity 0.5s ease',
          }}
        />
      )}
    </div>
  )
}
