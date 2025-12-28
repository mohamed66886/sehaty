"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Lalezar } from 'next/font/google';
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const lalezar = Lalezar({ 
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);
  return (
    <html lang="ar" dir="rtl" className={lalezar.variable}>
      <body className={lalezar.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
