"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0b0b0c] transition-colors duration-300">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/bg-2.png"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-10 dark:opacity-20"
        />
      </div>

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/90 to-white dark:from-black/50 dark:via-black/70 dark:to-black" />

      {/* CONTENT */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          {/* ICON */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#a06c45]/10 dark:bg-[#a06c45]/20 border border-[#a06c45]/20">
            <SearchX
              size={42}
              className="text-[#a06c45]"
            />
          </div>

          {/* 404 */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-[#a06c45] tracking-tight">
            404
          </h1>

          {/* HEADING */}
          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
            Page Not Found
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            The page you are trying to access doesn&apos;t exist or may have
            been moved. Explore other sections of TaskHub and continue building
            stunning AI-powered visuals.
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* HOME */}
            <Link
              href="/"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                h-12
                px-6
                rounded-2xl
                bg-[#a06c45]
                hover:bg-[#8c5d3b]
                text-white
                font-medium
                shadow-lg
                transition-all
                duration-300
                w-full
                sm:w-auto
              "
            >
              <Home size={18} />
              Back To Home
            </Link>

            {/* GO BACK */}
            <button
              onClick={() => window.history.back()}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                h-12
                px-6
                rounded-2xl
                border
                border-zinc-200
                dark:border-white/10
                bg-white
                dark:bg-[#161616]
                hover:bg-zinc-100
                dark:hover:bg-[#1d1d1d]
                text-zinc-800
                dark:text-zinc-200
                font-medium
                transition-all
                duration-300
                w-full
                sm:w-auto
              "
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* EXTRA TEXT */}
          <div className="mt-14 text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">
            TaskHub • AI Powered visual studio 
          </div>
        </div>
      </div>
    </main>
  );
}