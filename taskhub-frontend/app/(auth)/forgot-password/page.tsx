"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      toast.success(
        "Password reset link sent to your email"
      );

      setEmail("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white dark:bg-[#0b0b0c] transition-colors duration-300">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

        <Image
          src="/bg-2.png"
          alt="Forgot Password"
          fill
          priority
          sizes="50vw"
          className="object-cover brightness-[0.55]"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl">

            <h1 className="text-5xl font-bold leading-tight mb-6">
              Reset Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f3d6cb] to-[#b38363]">
                Password Securely
              </span>
            </h1>

            <p className="text-zinc-200 leading-relaxed">
              Enter your email address and we'll send you
              a secure password reset link.
            </p>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">

        <div className="w-full max-w-md">

          {/* BACK */}

          <Link
            href="/login"
            className="inline-flex items-center gap-2 mb-8 text-zinc-900 dark:text-white group"
          >
            <ArrowLeft
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            <span className="font-medium">
              Back to Login
            </span>
          </Link>

          {/* HEADING */}

          <div className="mb-8">

            <div className="w-16 h-16 rounded-2xl bg-[#a06c45]/10 flex items-center justify-center mb-5">
              <Mail
                size={30}
                className="text-[#a06c45]"
              />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Forgot Password?
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400">
              No worries. We'll send you reset instructions.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[#a06c45] hover:bg-[#8f5e39] disabled:opacity-70 text-white font-medium shadow-lg transition-all duration-300"
            >
              {loading
                ? "Sending Reset Link..."
                : "Send Reset Link"}
            </button>

          </form>

          {/* FOOTER */}

          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Remember your password?{" "}

            <Link
              href="/login"
              className="text-[#a06c45] font-medium hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}