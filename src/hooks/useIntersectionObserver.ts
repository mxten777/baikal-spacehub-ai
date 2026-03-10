import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: Options = {}
): boolean {
  const { threshold = 0, rootMargin = '0px', once = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          hasTriggered.current = true
          if (once) observer.disconnect()
        } else if (!once && !hasTriggered.current) {
          setIsIntersecting(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, once])

  return isIntersecting
}
