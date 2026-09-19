import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";
import { getSession } from "@/server/better-auth/server";
import { BlobBg } from "@/components/shared/blob-bg";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — brand blob (hidden on mobile) ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:w-[480px] xl:w-[560px]">
        <BlobBg variant="hero" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 shadow-lg">
            <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            {APP_NAME}
          </span>
        </Link>

        {/* Center quote */}
        <div className="relative z-10 space-y-6">
          <blockquote className="space-y-3">
            <p className="text-3xl font-black leading-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.3)]">
              "Every great event starts with the right team behind it."
            </p>
            <footer className="text-sm font-medium text-violet-200/80">
              — The {APP_NAME} Promise
            </footer>
          </blockquote>

          {/* Testimonial card */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 ring-2 ring-white/30" />
              <div>
                <p className="text-sm font-semibold text-white">Priya Mehta</p>
                <p className="text-xs text-violet-200/70">Booked 3 events via {APP_NAME}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-violet-100/90">
              "Found our wedding photographer in 10 minutes. The vendor was professional, affordable, and exactly what we imagined."
            </p>
            <div className="mt-2 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-xs text-violet-200/50">
          {APP_TAGLINE}
        </p>
      </div>

      {/* ── Right panel — form area ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile logo bar */}
        <div className="flex h-16 items-center border-b border-gray-100 px-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-extrabold text-gray-900">{APP_NAME}</span>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 border-t border-gray-100 px-6 py-4">
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
          <span className="text-gray-200">·</span>
          <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
          <span className="text-gray-200">·</span>
          <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600">Contact</Link>
        </div>
      </div>
    </div>
  );
}