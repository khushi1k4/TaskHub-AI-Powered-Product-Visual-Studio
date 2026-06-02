"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Check, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

const loginWithGoogle = async (role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("oauth_role", role);
  }
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

const loginWithGithub = async (role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('oauth_role', role);
  }
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // PASSWORD RULES

  const passwordChecks = useMemo(() => {
    return {
      minLength: formData.password.length >= 6,
      letters: (formData.password.match(/[A-Za-z]/g) || []).length >= 3,
      numbers: (formData.password.match(/[0-9]/g) || []).length >= 2,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };
  }, [formData.password]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.letters &&
    passwordChecks.numbers &&
    passwordChecks.special;

  // EMAIL VALIDATION

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // HANDLE CHANGE

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // EMAIL CHECK

    if (name === "password") {
  // hide error when input is empty
  if (value.trim() === "") {
    setErrors((prev) => ({
      ...prev,
      password: "",
    }));

    return;
  }

  const newPasswordChecks = {
    minLength: value.length >= 6,
    letters: (value.match(/[A-Za-z]/g) || []).length >= 3,
    numbers: (value.match(/[0-9]/g) || []).length >= 2,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  const validPassword =
    newPasswordChecks.minLength &&
    newPasswordChecks.letters &&
    newPasswordChecks.numbers &&
    newPasswordChecks.special;

  // show error only after user types password
  if (!validPassword) {
    setErrors((prev) => ({
      ...prev,
      password: "Password does not meet requirements. It must have a min 6 char, atleast 2 numbers, 3 letter and 1 special character.",
    }));
  } else {
    setErrors((prev) => ({
      ...prev,
      password: "",
    }));
  }

  // confirm password validation
  if (
    formData.confirmPassword &&
    value !== formData.confirmPassword
  ) {
    setErrors((prev) => ({
      ...prev,
      confirmPassword: "Password does not meet requirements. It must have a min 6 char, atleast 2 numbers, 3 letters and 1 special character.",
    }));
  } else {
    setErrors((prev) => ({
      ...prev,
      confirmPassword: "",
    }));
  }
}

    // PASSWORD CHECK

    if (name === "password") {
      if (!isPasswordValid) {
        setErrors((prev) => ({
          ...prev,
          password: "Password does not meet requirements. It must have a min 6 char, atleast 2 numbers, 3 letter and 1 special character.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      }

      // ALSO RECHECK CONFIRM PASSWORD

      if (
        formData.confirmPassword &&
        value !== formData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Password does not meet requirements. It must have a min 6 char, atleast 2 numbers, 3 letter and 1 special character.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!validateEmail(formData.email)) {
            setErrors((prev) => ({
            ...prev,
            email: "Enter a valid email address",
            }));
            toast.error("Invalid email address");
            return;
        }

        if (!isPasswordValid) {
            setErrors((prev) => ({
            ...prev,
            password: "Password does not meet requirements. It must have a min 6 char, atleast 2 numbers, 3 letter and 1 special character.",
            }));
            toast.error("Weak password");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
            }));
            toast.error("Passwords do not match");
            return;
        }

        try {
            // 1. Create user on backend using Admin API (which auto-confirms email)
            const { api } = await import('@/lib/api');
            await api.post('/auth/signup', {
                email: formData.email,
                password: formData.password,
                full_name: formData.name,
                role: role
            });

            // 2. Log them in on the client immediately
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (loginError) {
                toast.error("Account created, but couldn't log in automatically.");
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
                return;
            }

            // 3. Show success and redirect to appropriate dashboard
            toast.success("Account created successfully!");

            setTimeout(() => {
              if (role === 'admin') {
                router.push("/admin/");
              } else {
                router.push("/user/");
              }
            }, 1000);
            
        } catch (error: any) {
            console.error("Signup error:", error);
            const errorMessage = error.response?.data?.error || error.message || "Failed to create account";
            toast.error(errorMessage);
        }
    };

  return (
    <main className="min-h-screen flex bg-white dark:bg-[#0b0b0c] transition-colors duration-300">

      {/* LEFT SECTION */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

        <Image
          src="/bg-2.png"
          alt="Signup Background"
          fill
          priority
          sizes="50vw"
          className="object-cover brightness-[0.55]"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
              <Sparkles size={16} />
              <span className="text-sm">
                AI Powered Product Visual Studio
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-6">
              Join The Future Of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f3d6cb] to-[#b38363]">
                AI Product Design
              </span>
            </h1>

            <p className="text-zinc-200 text-base leading-relaxed">
              Create luxury product visuals, collaborate with teams,
              manage creative workflows, and generate modern AI-driven
              e-commerce assets.
            </p>

          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 overflow-y-auto">

        <div className="w-full max-w-md">

          {/* BACK */}

          <Link
            href="/"
            className="inline-flex items-center gap-3 mb-8 group"
          >
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <ArrowLeft
                size={18}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />

              <span className="text-lg font-semibold">
                Back
              </span>
            </div>
          </Link>

          {/* HEADING */}

          <div className="mb-8">

            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Create Account
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              Sign up and start generating AI-powered visuals.
            </p>

          </div>

          {/* FORM */}

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />
            </div>

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

              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />
              {formData.password.length > 0 && (
                <div className="mt-4 space-y-2 bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                  <PasswordRule valid={passwordChecks.minLength} text="At least 6 characters" />
                  <PasswordRule valid={passwordChecks.letters} text="At least 3 letters" />
                  <PasswordRule valid={passwordChecks.numbers} text="At least 2 numbers" />
                  <PasswordRule valid={passwordChecks.special} text="At least 1 special character" />
                </div>
              )}
                {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                    {errors.password}
                </p>
                )}
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* ROLE */}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Select Role
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* USER */}

                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`rounded-2xl border p-4 transition-all
                  ${
                    role === "user"
                      ? "border-[#a06c45] bg-[#faf7f5] dark:bg-[#1d1b18]"
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161616]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles
                      size={22}
                      className="text-[#a06c45]"
                    />

                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      User
                    </span>
                  </div>
                </button>

                {/* ADMIN */}

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`rounded-2xl border p-4 transition-all
                  ${
                    role === "admin"
                      ? "border-[#a06c45] bg-[#faf7f5] dark:bg-[#1d1b18]"
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161616]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck
                      size={22}
                      className="text-[#a06c45]"
                    />

                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      Admin
                    </span>
                  </div>
                </button>

              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#a06c45] hover:bg-[#8f5e39] text-white font-medium shadow-lg transition-all duration-300"
            >
              Create Account
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

          {/* OAUTH */}

          <div className="space-y-4">

            <button
              onClick={() => loginWithGoogle(role)}
              type="button"
              className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161616] hover:bg-zinc-50 dark:hover:bg-[#1d1d1d] flex items-center justify-center gap-3 transition-all duration-300"
            >
              <FcGoogle size={22} />

              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Continue with Google
              </span>
            </button>

            <button
              onClick={() => loginWithGithub(role)}
              type="button"
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
            Already have an account?{" "}
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

/* PASSWORD RULE COMPONENT */

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check
          size={16}
          className="text-green-500"
        />
      ) : (
        <X
          size={16}
          className="text-red-500"
        />
      )}

      <span
        className={
          valid
            ? "text-green-600 dark:text-green-400"
            : "text-zinc-500 dark:text-zinc-400"
        }
      >
        {text}
      </span>
    </div>
  );
}