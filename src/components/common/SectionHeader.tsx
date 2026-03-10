interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  light?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
}: SectionHeaderProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[align]

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && (
        <p className={`font-sans text-[10px] font-medium tracking-[0.2em] uppercase mb-4 ${light ? 'text-white/35' : 'text-brand-muted'}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display font-light leading-[1.08] mb-5 ${light ? 'text-white' : 'text-brand-black'}`}
        style={{ fontSize: 'clamp(2rem, 4vw, 3.75rem)', letterSpacing: '-0.03em' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`font-sans text-[15px] leading-relaxed ${light ? 'text-white/50' : 'text-brand-muted'}`}
          style={{ maxWidth: '500px' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

