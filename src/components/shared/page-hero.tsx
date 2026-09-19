import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BlobBg } from "./blob-bg";

interface PageHeroProps {
  /** Large display heading — supports JSX so you can style parts differently */
  title: ReactNode;
  subtitle?: string;
  /** Action buttons / search bar rendered below the subtitle */
  actions?: ReactNode;
  /** Extra content rendered in the right column (desktop only) */
  aside?: ReactNode;
  className?: string;
  /** Controls padding and height preset */
  size?: "lg" | "md" | "sm";
  /** Render the cityscape silhouette at the bottom */
  cityscape?: boolean;
}

/**
 * Full-width hero section with the brand blob gradient background.
 * Mirrors the visual language from the reference — large layered blobs,
 * deep violet → periwinkle → sky gradient, white text with drop shadow.
 *
 * @example
 * <PageHero
 *   title={<>Plan Your <span className="text-violet-200">Perfect</span> Event</>}
 *   subtitle="Discover top vendors across every category."
 *   actions={<SearchBar />}
 *   cityscape
 * />
 */
export function PageHero({
  title,
  subtitle,
  actions,
  aside,
  className,
  size = "lg",
  cityscape = false,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        size === "lg" && "min-h-[580px] py-28 md:py-36",
        size === "md" && "min-h-[380px] py-20 md:py-28",
        size === "sm" && "min-h-[240px] py-14 md:py-20",
        className,
      )}
    >
      {/* Blob gradient background */}
      <BlobBg variant="hero" />

      {/* Cityscape overlay at the very bottom */}
      {cityscape && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 opacity-20"
        >
          <svg
            viewBox="0 0 1440 192"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <g fill="#1e1b4b">
              <rect x="0" y="60" width="60" height="132" />
              <rect x="70" y="40" width="45" height="152" />
              <rect x="125" y="70" width="35" height="122" />
              <rect x="170" y="30" width="55" height="162" />
              <rect x="235" y="50" width="40" height="142" />
              <rect x="285" y="20" width="70" height="172" />
              <rect x="365" y="60" width="30" height="132" />
              <rect x="405" y="40" width="50" height="152" />
              <rect x="465" y="55" width="35" height="137" />
              <rect x="510" y="25" width="60" height="167" />
              <rect x="580" y="50" width="45" height="142" />
              <rect x="635" y="35" width="55" height="157" />
              <rect x="700" y="60" width="40" height="132" />
              <rect x="750" y="20" width="75" height="172" />
              <rect x="835" y="50" width="35" height="142" />
              <rect x="880" y="35" width="50" height="157" />
              <rect x="940" y="65" width="45" height="127" />
              <rect x="995" y="40" width="60" height="152" />
              <rect x="1065" y="55" width="40" height="137" />
              <rect x="1115" y="25" width="70" height="167" />
              <rect x="1195" y="60" width="35" height="132" />
              <rect x="1240" y="40" width="50" height="152" />
              <rect x="1300" y="30" width="65" height="162" />
              <rect x="1375" y="55" width="65" height="137" />
            </g>
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex flex-col gap-8",
            aside && "lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          <div className="flex max-w-3xl flex-col gap-5">
            {/* Title */}
            <h1
              className={cn(
                "font-extrabold tracking-tight text-white",
                "[text-shadow:0_4px_24px_rgba(0,0,0,0.35)]",
                size === "lg" && "text-5xl leading-[1.05] md:text-7xl",
                size === "md" && "text-4xl md:text-5xl",
                size === "sm" && "text-3xl md:text-4xl",
              )}
            >
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p
                className={cn(
                  "text-violet-100/90",
                  "[text-shadow:0_2px_12px_rgba(0,0,0,0.25)]",
                  size === "lg" && "max-w-2xl text-lg md:text-xl",
                  size === "md" && "max-w-xl text-base md:text-lg",
                  size === "sm" && "max-w-lg text-sm md:text-base",
                )}
              >
                {subtitle}
              </p>
            )}

            {/* Actions */}
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>

          {/* Right aside (e.g. pricing card, stat badges) */}
          {aside && (
            <div className="shrink-0 lg:max-w-sm xl:max-w-md">{aside}</div>
          )}
        </div>
      </div>
    </section>
  );
}