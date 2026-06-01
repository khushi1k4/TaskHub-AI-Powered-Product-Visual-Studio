import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1a1918] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 lg:py-15">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 items-start">

          {/* Brand (Left) */}
          <div className="space-y-5">
            <Logo />
            <p className="text-sm text-black dark:text-zinc-400 leading-relaxed max-w-xs">
              Modern AI product studio for women e-commerce. Create stunning visual assets effortlessly.
            </p>
          </div>

          {/* Platform (Middle) */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              Platform
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-zinc-800 dark:text-zinc-300">
                Task assignment by Admin
              </li>
              <li className="text-sm text-zinc-800 dark:text-zinc-300">
                User-based AI visual generation
              </li>
              <li className="text-sm text-zinc-800 dark:text-zinc-300">
                Theme-based creative outputs
              </li>
              <li className="text-sm text-zinc-800 dark:text-zinc-300">
                Workflow management system
              </li>
            </ul>
          </div>

          {/* Resources (Right) */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-zinc-500 hover:text-[var(--color-primary-brown)] dark:text-zinc-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-[var(--color-primary-brown)] dark:text-zinc-400 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#uses" className="text-sm text-zinc-500 hover:text-[var(--color-primary-brown)] dark:text-zinc-400 transition-colors">
                  AI generated backgrounds
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* copyright Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-white/10">
          <div className="flex items-center justify-center text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © {currentYear} TaskHub Studio. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}