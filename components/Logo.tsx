export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Outer circle - represents the frame */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        opacity="0.8"
      />

      {/* Artist palette shape */}
      <path
        d="M 30 35 Q 25 35 25 40 L 25 60 Q 25 65 30 65 L 55 65 Q 60 65 60 60 L 60 55 Q 60 50 65 50 L 70 50 Q 75 50 75 45 L 75 40 Q 75 35 70 35 Z"
        fill="url(#logoGradient)"
        opacity="0.9"
      />

      {/* Paint brush stroke */}
      <path
        d="M 65 25 L 75 15 M 70 30 L 80 20"
        stroke="url(#accentGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Brush tip */}
      <circle cx="72" cy="22" r="4" fill="url(#accentGradient)" />

      {/* Palette color dots */}
      <circle cx="35" cy="45" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="45" cy="45" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="35" cy="55" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="50" cy="55" r="3" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
