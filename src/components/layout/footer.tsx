import Link from "next/link";
import {
  Calendar,
  Mail,
  MapPin,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE, CATEGORIES } from "@/lib/constants";

const FOOTER_LINKS = {
  Platform: [
    { label: "Browse Events", href: "/events" },
    { label: "Find Vendors", href: "/vendors" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],
  "For Vendors": [
    { label: "Become a Vendor", href: "/sign-up" },
    { label: "Vendor Dashboard", href: "/vendor/dashboard" },
    { label: "Create Listing", href: "/vendor/listings/new" },
    { label: "Vendor FAQ", href: "/faq" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
} as const;

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const SOCIAL = [
  { icon: TwitterIcon, href: "#", label: "Twitter" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
  { icon: GithubIcon, href: "#", label: "GitHub" },
] as const;

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#1a0f42]">
      {/* Top wave divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16">
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <path
            d="M0,32 C360,64 1080,0 1440,32 L1440,0 L0,0 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Cityscape silhouette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 opacity-10"
      >
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="xMidYMin meet"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <g fill="#a78bfa">
            <rect x="0" y="80" width="50" height="140" />
            <rect x="60" y="60" width="40" height="160" />
            <rect x="110" y="90" width="30" height="130" />
            <rect x="150" y="50" width="60" height="170" />
            <rect x="220" y="70" width="35" height="150" />
            <rect x="265" y="40" width="70" height="180" />
            <rect x="345" y="80" width="30" height="140" />
            <rect x="385" y="60" width="45" height="160" />
            <rect x="440" y="75" width="35" height="145" />
            <rect x="485" y="45" width="55" height="175" />
            <rect x="550" y="70" width="40" height="150" />
            <rect x="600" y="55" width="50" height="165" />
            <rect x="660" y="80" width="35" height="140" />
            <rect x="705" y="35" width="70" height="185" />
            <rect x="785" y="65" width="30" height="155" />
            <rect x="825" y="50" width="50" height="170" />
            <rect x="885" y="85" width="40" height="135" />
            <rect x="935" y="55" width="55" height="165" />
            <rect x="1000" y="75" width="35" height="145" />
            <rect x="1045" y="40" width="65" height="180" />
            <rect x="1120" y="80" width="30" height="140" />
            <rect x="1160" y="60" width="45" height="160" />
            <rect x="1215" y="45" width="60" height="175" />
            <rect x="1285" y="70" width="40" height="150" />
            <rect x="1335" y="55" width="50" height="165" />
            <rect x="1395" y="80" width="45" height="140" />
            {/* Windows */}
            {[
              [5, 90], [18, 90], [5, 105], [18, 105],
              [270, 55], [285, 55], [300, 55],
              [710, 50], [728, 50], [710, 68], [728, 68],
              [1050, 55], [1068, 55], [1086, 55],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="10" height="7" fill="#7EC8E3" opacity="0.6" />
            ))}
          </g>
        </svg>
      </div>

      {/* Blob accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-violet-700/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-20 h-80 w-80 rounded-full bg-indigo-700/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 gap-10 border-b border-white/10 pb-12 md:grid-cols-6 lg:grid-cols-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-6 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-lg shadow-violet-900/40">
                <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {APP_NAME}
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-violet-200/60">
              {APP_TAGLINE}
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-sm text-violet-200/50">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>Bengaluru, India</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-violet-200/50">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <a href="mailto:hello@evenza.in" className="hover:text-violet-200 transition-colors">
                hello@evenza.in
              </a>
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:border-violet-400/40 hover:bg-violet-500/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="col-span-1 md:col-span-3 lg:col-span-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-300/70">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-violet-200/50 transition-colors hover:text-violet-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 py-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-300/50">
            Categories
          </span>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/events?category=${cat.value}`}
              className="text-xs text-violet-200/40 transition-colors hover:text-violet-200"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 sm:flex-row">
          <p className="text-xs text-violet-200/30">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-violet-200/30">
            Built with ♥ in Bengaluru
          </p>
        </div>
      </div>
    </footer>
  );
}