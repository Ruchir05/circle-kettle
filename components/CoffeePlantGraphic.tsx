/**
 * Decorative inline SVG — coffee branch with leaves, blossoms, and cherries.
 * Wrapped in `.coffee-plant-motion` for a slow CSS drift (see globals.css).
 */
export function CoffeePlantGraphic() {
  return (
    <svg
      viewBox="0 0 220 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="coffee-plant-graphic-svg h-auto w-full max-w-[min(300px,72vw)] sm:max-w-[min(360px,58vw)] lg:max-w-[440px] xl:max-w-[520px]"
      aria-hidden
    >
      <path
        d="M108 280c-4-48 8-92 24-128 18-42 44-72 62-98"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M118 268c12-36 38-62 58-84"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Leaves */}
      <path
        d="M132 175c-18-8-32-28-28-52 24 8 40 32 28 52z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M154 120c-22 4-38-14-42-38 26-2 46 14 42 38z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M98 200c20-6 28-32 18-52-16 14-24 36-18 52z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* White coffee flowers */}
      <g opacity="0.9">
        <circle cx="168" cy="88" r="5" fill="currentColor" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="168"
            cy="88"
            rx="10"
            ry="4"
            fill="currentColor"
            opacity="0.55"
            transform={`rotate(${deg} 168 88)`}
          />
        ))}
      </g>
      <g opacity="0.75">
        <circle cx="142" cy="132" r="4" fill="currentColor" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="142"
            cy="132"
            rx="8"
            ry="3.2"
            fill="currentColor"
            opacity="0.5"
            transform={`rotate(${deg} 142 132)`}
          />
        ))}
      </g>
      {/* Cherries */}
      <g>
        <ellipse cx="122" cy="208" rx="14" ry="18" fill="currentColor" opacity="0.5" />
        <ellipse cx="108" cy="222" rx="12" ry="15" fill="currentColor" opacity="0.42" />
        <ellipse cx="138" cy="222" rx="11" ry="14" fill="currentColor" opacity="0.38" />
        <path
          d="M122 190v22M108 207v15M138 208v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}
