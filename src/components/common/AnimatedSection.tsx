import { useRef } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right'
  delay?: number
}

export default function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(ref, { threshold: 0.1, once: true })

  const animationClasses = {
    'fade-up': 'translate-y-8 opacity-0',
    'fade-in': 'opacity-0',
    'slide-left': '-translate-x-8 opacity-0',
    'slide-right': 'translate-x-8 opacity-0',
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-expo-out ${className} ${
        isInView ? 'opacity-100 translate-x-0 translate-y-0' : animationClasses[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
