import { cn } from "@/lib/utils";

interface BlobBgProps {
  className?: string;
  /** Controls which preset blob arrangement to render */
  variant?: "hero" | "auth" | "section" | "card";
}

/**
 * Decorative SVG blob background inspired by the reference design's
 * fluid violet-to-sky gradient mesh with organic shapes.
 *
 * Drop this as the first child inside a `relative overflow-hidden` container.
 */
export function BlobBg({ className, variant = "hero" }: BlobBgProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "hero" && <HeroBlobs />}
      {variant === "auth" && <AuthBlobs />}
      {variant === "section" && <SectionBlobs />}
      {variant === "card" && <CardBlobs />}
    </div>
  );
}

// ─── Hero — full-page gradient with large organic blobs ───────────────────────
function HeroBlobs() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D1B69" />
          <stop offset="45%" stopColor="#5B4FCF" />
          <stop offset="100%" stopColor="#7EC8E3" />
        </linearGradient>
        <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="blobGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7EC8E3" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B4FCF" stopOpacity="0.3" />
        </linearGradient>
        <filter id="blur1">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      {/* Base gradient fill */}
      <rect width="1440" height="900" fill="url(#heroGrad)" />

      {/* Top-right large blob */}
      <ellipse
        cx="1200"
        cy="150"
        rx="420"
        ry="320"
        fill="url(#blobGrad1)"
        filter="url(#blur1)"
      />

      {/* Bottom-left blob */}
      <ellipse
        cx="200"
        cy="750"
        rx="380"
        ry="280"
        fill="url(#blobGrad2)"
        filter="url(#blur1)"
      />

      {/* Center accent blob */}
      <path
        d="M600 100 C750 50 900 200 850 380 C800 560 600 520 480 420 C360 320 450 150 600 100Z"
        fill="#C7B8F5"
        opacity="0.2"
        filter="url(#blur1)"
      />

      {/* Cityscape silhouette at bottom */}
      <CityscapeSilhouette />
    </svg>
  );
}

// ─── Auth — compact blob for sign-in / sign-up ────────────────────────────────
function AuthBlobs() {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D1B69" />
          <stop offset="60%" stopColor="#5B4FCF" />
          <stop offset="100%" stopColor="#7EC8E3" />
        </linearGradient>
        <filter id="ablur">
          <feGaussianBlur stdDeviation="50" />
        </filter>
      </defs>
      <rect width="800" height="600" fill="url(#authGrad)" />
      <circle cx="650" cy="80" r="260" fill="#7C3AED" opacity="0.4" filter="url(#ablur)" />
      <circle cx="100" cy="500" r="220" fill="#7EC8E3" opacity="0.3" filter="url(#ablur)" />
    </svg>
  );
}

// ─── Section — subtle blobs for content section backgrounds ──────────────────
function SectionBlobs() {
  return (
    <svg
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="sectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <filter id="sblur">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>
      <rect width="1440" height="400" fill="url(#sectionGrad)" />
      <circle cx="200" cy="200" r="300" fill="#A78BFA" opacity="0.15" filter="url(#sblur)" />
      <circle cx="1200" cy="150" r="280" fill="#7EC8E3" opacity="0.12" filter="url(#sblur)" />
    </svg>
  );
}

// ─── Card — tiny accent blob for card hover states ────────────────────────────
function CardBlobs() {
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D1B69" />
          <stop offset="100%" stopColor="#5B4FCF" />
        </linearGradient>
        <filter id="cblur">
          <feGaussianBlur stdDeviation="25" />
        </filter>
      </defs>
      <rect width="400" height="200" fill="url(#cardGrad)" />
      <circle cx="350" cy="30" r="120" fill="#A78BFA" opacity="0.5" filter="url(#cblur)" />
      <circle cx="50" cy="180" r="100" fill="#7EC8E3" opacity="0.35" filter="url(#cblur)" />
    </svg>
  );
}

// ─── Cityscape silhouette — reusable inside hero ──────────────────────────────
function CityscapeSilhouette() {
  return (
    <g opacity="0.25" fill="#1e1b4b">
      {/* Far background buildings */}
      <rect x="0" y="720" width="60" height="180" />
      <rect x="70" y="700" width="45" height="200" />
      <rect x="125" y="730" width="35" height="170" />
      <rect x="170" y="690" width="55" height="210" />
      <rect x="235" y="710" width="40" height="190" />
      <rect x="285" y="680" width="70" height="220" />
      <rect x="365" y="720" width="30" height="180" />
      <rect x="405" y="700" width="50" height="200" />
      <rect x="465" y="715" width="35" height="185" />
      <rect x="510" y="685" width="60" height="215" />
      <rect x="580" y="710" width="45" height="190" />
      <rect x="635" y="695" width="55" height="205" />
      <rect x="700" y="720" width="40" height="180" />
      <rect x="750" y="680" width="75" height="220" />
      <rect x="835" y="710" width="35" height="190" />
      <rect x="880" y="695" width="50" height="205" />
      <rect x="940" y="725" width="45" height="175" />
      <rect x="995" y="700" width="60" height="200" />
      <rect x="1065" y="715" width="40" height="185" />
      <rect x="1115" y="685" width="70" height="215" />
      <rect x="1195" y="720" width="35" height="180" />
      <rect x="1240" y="700" width="50" height="200" />
      <rect x="1300" y="690" width="65" height="210" />
      <rect x="1375" y="715" width="65" height="185" />
      {/* Windows */}
      <rect x="5" y="730" width="10" height="8" fill="#7EC8E3" opacity="0.4" />
      <rect x="20" y="730" width="10" height="8" fill="#7EC8E3" opacity="0.4" />
      <rect x="5" y="748" width="10" height="8" fill="#7EC8E3" opacity="0.3" />
      <rect x="295" y="695" width="12" height="9" fill="#A78BFA" opacity="0.4" />
      <rect x="312" y="695" width="12" height="9" fill="#A78BFA" opacity="0.3" />
      <rect x="760" y="692" width="14" height="10" fill="#7EC8E3" opacity="0.4" />
      <rect x="780" y="692" width="14" height="10" fill="#7EC8E3" opacity="0.3" />
      <rect x="760" y="708" width="14" height="10" fill="#7EC8E3" opacity="0.3" />
    </g>
  );
}

// Export silhouette separately so it can be reused in footer
export { CityscapeSilhouette };