"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : "light";
  const logoSrc = currentTheme === "dark" ? "/whitebg-Logo.png" : "/logo-bg.png";

  return (
    <Link
      href="/"
      className="flex items-center"
    >
      <div className="relative w-[140px] h-[40px] sm:w-[180px] sm:h-[50px] md:w-[220px] md:h-[60px]">
        {mounted && (
          <Image
            src={logoSrc}
            alt="TaskHub Logo"
            fill
            sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 220px"
            priority
            className="object-contain object-left"
          />
        )}
      </div>
    </Link>
  );
}
