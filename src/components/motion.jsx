import { motion, useReducedMotion } from 'framer-motion'

// Shared animation variants — used across all card grids
export const reducedCheck = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// AnimatedGrid — stagger-entrance wrapper; falls back to plain div if reduced motion
export function AnimatedGrid({ children, style, className }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div style={style} className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// AnimatedCard — single card entrance + hover scale; whileInView for below-fold
export function AnimatedCard({ children, index = 0, style, className, onClick }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div style={style} className={className} onClick={onClick}>{children}</div>
  }

  // First 20 cards animate on mount; beyond that use whileInView to avoid
  // animating 100+ elements simultaneously
  const useMount = index < 20

  return (
    <motion.div
      variants={cardVariants}
      {...(useMount ? {} : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -60px 0px' } })}
      whileHover={{ scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } }}
      style={{ ...style, willChange: 'transform, opacity' }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// PageTransition — fade + 8px upward slide; wraps each page
export function PageTransition({ children }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
