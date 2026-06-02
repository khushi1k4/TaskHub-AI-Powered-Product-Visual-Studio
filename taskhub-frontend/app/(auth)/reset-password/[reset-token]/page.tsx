"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  Check,
  LockKeyhole,
  X,
} from "lucide-react";

import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  const params = useParams();

  const token = params.token as string;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  // PASSWORD RULES

  const passwordChecks = useMemo(() => {
    return {
      minLength: formData.password.length >= 6,

      letters:
        (formData.password.match(/[A-Za-z]/g) || [])
          .length >= 3,

      numbers:
        (formData.password.match(/[0-9]/g) || [])
          .length >= 2,

      special:
        /[!@#$%^&*(),.?":{}|<>]/.test(
          formData.password
        ),
    };
  }, [formData.password]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.letters &&
    passwordChecks.numbers &&
    passwordChecks.special;

  // HANDLE CHANGE

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // PASSWORD VALIDATION

    if (name === "password") {
      if (value.length === 0) {
        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      } else {
        const checks = {
          minLength: value.length >= 6,

          letters:
            (value.match(/[A-Za-z]/g) || [])
              .length >= 3,

          numbers:
            (value.match(/[0-9]/g) || []).length >= 2,

          special:
            /[!@#$%^&*(),.?":{}|<>]/.test(value),
        };

        const valid =
          checks.minLength &&
          checks.letters &&
          checks.numbers &&
          checks.special;

        setErrors((prev) => ({
          ...prev,
          password: valid
            ? ""
            : "Password does not meet requirements",
        }));
      }

      // RECHECK CONFIRM PASSWORD

      if (
        formData.confirmPassword &&
        value !== formData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }

    // CONFIRM PASSWORD VALIDATION

    if (name === "confirmPassword") {
      if (value.length === 0) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      } else if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  // HANDLE SUBMIT

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Weak password");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        password: formData.password,
      });

      toast.success(
        "Password reset successfully"
      );

      router.push("/login");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white dark:bg-[#0b0b0c] transition-colors duration-300">

      {/* LEFT SECTION */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

        <Image
          src="/bg-2.png"
          alt="Reset Password"
          fill
          priority
          sizes="50vw"
          className="object-cover brightness-[0.55]"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
              <LockKeyhole size={16} />

              <span className="text-sm">
                Secure Password Recovery
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-6">
              Create Your New
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f3d6cb] to-[#b38363]">
                Secure Password
              </span>
            </h1>

            <p className="text-zinc-200 text-base leading-relaxed">
              Your password reset link is verified.
              Create a strong password to secure your
              account.
            </p>

          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 overflow-y-auto">

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
              <LockKeyhole
                size={30}
                className="text-[#a06c45]"
              />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Reset Password
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              Enter your new secure password below.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                New Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create new password"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />

              {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.password}
                </p>
              )}

              {/* PASSWORD RULES */}

              <div className="mt-4 space-y-2">

                <PasswordRule
                  valid={passwordChecks.minLength}
                  text="Minimum 6 characters"
                />

                <PasswordRule
                  valid={passwordChecks.letters}
                  text="At least 3 letters"
                />

                <PasswordRule
                  valid={passwordChecks.numbers}
                  text="At least 2 numbers"
                />

                <PasswordRule
                  valid={passwordChecks.special}
                  text="At least 1 special character"
                />

              </div>
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
                placeholder="Confirm new password"
                className="w-full h-12 px-4 rounded-2xl bg-[#f8f5f2] dark:bg-[#161616] border border-[#ece4df] dark:border-white/10 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#a06c45] transition-all"
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[#a06c45] hover:bg-[#8f5e39] disabled:opacity-70 text-white font-medium shadow-lg transition-all duration-300"
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}

/* PASSWORD RULE */

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