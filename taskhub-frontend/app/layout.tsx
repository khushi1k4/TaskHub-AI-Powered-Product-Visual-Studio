import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskHub - AI Powered Product Visual Studio",
  description: "AI Studio for Modern Product Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen
          bg-white
          dark:bg-[#0b0b0c]
          transition-colors
          duration-300
          antialiased
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}

          {/* TOASTER */}

          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,

              style: {
                background: "#18181b",
                color: "#ffffff",
                borderRadius: "14px",
                padding: "14px 16px",
                fontSize: "14px",
              },

              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },

              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}