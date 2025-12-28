import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Lalezar } from 'next/font/google';

const lalezar = Lalezar({ 
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "حصتي",
  description: "منصة تعليمية متكاملة لمتابعة الطلاب والمدرسين وأولياء الأمور",
  keywords: "تعليم، مدرسة، طلاب، معلمين، أولياء أمور، متابعة، واجبات، امتحانات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
