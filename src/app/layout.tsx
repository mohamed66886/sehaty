import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "حصتي - متابعة الطالب لحظة بلحظة",
  description: "منصة تعليمية متكاملة لمتابعة الطلاب والمدرسين وأولياء الأمور",
  keywords: "تعليم، مدرسة، طلاب، معلمين، أولياء أمور، متابعة، واجبات، امتحانات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
