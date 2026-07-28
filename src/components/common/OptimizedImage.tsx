interface ImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "cinema" | "auto";
  objectFit?: "cover" | "contain";
}

const ratioClasses = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  cinema: "aspect-[21/9]",
  auto: "",
};

export default function OptimizedImage({
  src,
  alt,
  className = "",
  aspectRatio = "landscape",
  objectFit = "cover",
}: ImageProps) {
  return (
    <div
      className={`overflow-hidden bg-brand-warm ${ratioClasses[aspectRatio]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
            objectFit === "cover" ? "object-cover" : "object-contain"
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="font-display text-brand-muted/30 tracking-widest text-xs uppercase">
            이미지 준비 중
          </span>
        </div>
      )}
    </div>
  );
}
