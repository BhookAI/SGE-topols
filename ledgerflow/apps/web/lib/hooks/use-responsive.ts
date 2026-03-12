'use client'

import { useState, useEffect } from 'react'

// Breakpoints según Tailwind
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type Breakpoint = keyof typeof breakpoints

/**
 * Hook para detectar el breakpoint actual
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(null)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      if (width >= breakpoints['2xl']) setBreakpoint('2xl')
      else if (width >= breakpoints.xl) setBreakpoint('xl')
      else if (width >= breakpoints.lg) setBreakpoint('lg')
      else if (width >= breakpoints.md) setBreakpoint('md')
      else if (width >= breakpoints.sm) setBreakpoint('sm')
      else setBreakpoint(null)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { breakpoint, windowWidth }
}

/**
 * Hook para detectar si es móvil
 */
export function useIsMobile() {
  const { windowWidth } = useBreakpoint()
  return windowWidth < breakpoints.md
}

/**
 * Hook para detectar si es tablet
 */
export function useIsTablet() {
  const { windowWidth } = useBreakpoint()
  return windowWidth >= breakpoints.md && windowWidth < breakpoints.lg
}

/**
 * Hook para detectar si es desktop
 */
export function useIsDesktop() {
  const { windowWidth } = useBreakpoint()
  return windowWidth >= breakpoints.lg
}

/**
 * Hook para detectar orientación
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientation = () => {
      if (window.screen.orientation) {
        setOrientation(
          window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
        )
      } else {
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      }
    }

    handleOrientation()
    window.addEventListener('orientationchange', handleOrientation)
    window.addEventListener('resize', handleOrientation)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientation)
      window.removeEventListener('resize', handleOrientation)
    }
  }, [])

  return orientation
}

/**
 * Hook para detectar si el dispositivo soporta touch
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

/**
 * Hook para detectar preferencia de reducción de movimiento
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook combinado con toda la información responsive
 */
export function useResponsive() {
  const { breakpoint, windowWidth } = useBreakpoint()
  const isMobile = windowWidth < breakpoints.md
  const isTablet = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg
  const isDesktop = windowWidth >= breakpoints.lg
  const orientation = useOrientation()
  const isTouch = useIsTouch()
  const prefersReducedMotion = usePrefersReducedMotion()

  return {
    // Breakpoints
    breakpoint,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    
    // Booleanos convenientes
    isSm: windowWidth >= breakpoints.sm,
    isMd: windowWidth >= breakpoints.md,
    isLg: windowWidth >= breakpoints.lg,
    isXl: windowWidth >= breakpoints.xl,
    is2xl: windowWidth >= breakpoints['2xl'],
    
    // Orientación
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    
    // Capacidades
    isTouch,
    prefersReducedMotion,
  }
}

export default useResponsive
