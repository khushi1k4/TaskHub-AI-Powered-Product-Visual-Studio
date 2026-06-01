"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabase";

const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });
};

const loginWithGithub = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Fetch user role to redirect appropriately
      const { api } = await import("@/lib/api");
      const response = await api.get("/auth/me");
      const role = response.data?.user?.role || "user";

      toast.success("Logged in successfully");
      
      if (role === "admin") {
        window.location.href = "/admin/";
      } else {
        window.location.href = "/user/";
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0b0b0c] transition-colors duration-300 overflow-hidden">
      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen">
        <Image
          src="/bg-2.png"
          alt="AI Product"
          fill
          priority
          sizes="50vw"
          className="object-cover brightness-[0.65] contrast-125"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Elevate Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f3d6cb] to-[#b38363]">
                Product Visuals
              </span>
            </h1>

            <p className="text-zinc-200 text-base leading-relaxed">
              Generate premium AI-powered product photography,
              luxury backgrounds, and modern e-commerce visuals
              for your brand.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-8 md:px-10 lg:px-16 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* LOGO */}

          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                <ArrowLeft size={18} />
    
                <span className="text-lg font-semibold">
                    Back
                </span>
            </div>
          </Link>

          {/* HEADING */}

          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Welcome Back
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              Login to continue creating stunning AI visuals.
              </p>
          </div>

          {/* FORM */}

            <form className="space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-[#a06c45] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                Remember me
              </label>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#a06c45] hover:bg-[#8f5e39] text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-white/10" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-[#0b0b0c] px-4 text-zinc-500 dark:text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAUTH BUTTONS */}

          <div className="space-y-4">
            {/* GOOGLE */}

            <button
              onClick={loginWithGoogle}
              className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161616] hover:bg-zinc-50 dark:hover:bg-[#1d1d1d] flex items-center justify-center gap-3 transition-all duration-300"
            >
              <FcGoogle size={22} />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Continue with Google
              </span>
            </button>

            {/* GITHUB */}

            <button
              onClick={loginWithGithub}
              className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161616] hover:bg-zinc-50 dark:hover:bg-[#1d1d1d] flex items-center justify-center gap-3 transition-all duration-300"
            >
              <FaGithub className="text-zinc-900 dark:text-white text-[20px]" />

              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Continue with GitHub
              </span>
            </button>
          </div>

          {/* FOOTER */}

          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account? {" "}
            <Link
              href="/signup"
              className="text-[#a06c45] font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}