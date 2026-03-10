import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <Loader2 className={`${sizeClass} animate-spin text-brand-accent`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-white">
      <div className="text-center">
        <div className="font-display text-3xl font-light tracking-widest text-brand-black mb-6 animate-pulse">
          The Lit
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-brand-accent mx-auto" />
      </div>
    </div>
  )
}
