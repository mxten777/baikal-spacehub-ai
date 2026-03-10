interface ImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'cinema' | 'auto'
  objectFit?: 'cover' | 'contain'
  fallback?: string
}

const ratioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  cinema: 'aspect-[21/9]',
  auto: '',
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 'landscape',
  objectFit = 'cover',
  fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
}: ImageProps) {
  return (
    <div className={`overflow-hidden bg-brand-warm ${ratioClasses[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
          objectFit === 'cover' ? 'object-cover' : 'object-contain'
        }`}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (target.src !== fallback) target.src = fallback
        }}
      />
    </div>
  )
}
