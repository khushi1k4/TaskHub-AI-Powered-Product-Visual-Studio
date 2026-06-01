"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Uses", href: "#uses" },
  ];

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white dark:bg-black/30 border-b border-zinc-200 dark:border-white/10">
      
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl border-1 border-black dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-sm font-medium"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary-brown)] text-white hover:opacity-90 transition shadow-lg text-sm font-medium"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Button */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#1f1d1c] shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-20 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-white">
            Menu
          </span>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Links */}
        <div className="px-5 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-base font-medium"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block text-center px-5 py-3 rounded-xl border-1 border-black dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            onClick={() => setIsOpen(false)}
            className="block text-center px-5 py-3 rounded-xl bg-[var(--color-primary-brown)] text-white hover:opacity-90 transition shadow-lg font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}