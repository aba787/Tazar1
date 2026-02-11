import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "منصة تآزر الصناعية",
    template: "%s | منصة تآزر الصناعية",
  },
  description: "منصة تربط المصانع السعودية الصغيرة والمتوسطة للشراء الجماعي وتبادل الطاقة الإنتاجية",
  keywords: [
    "مصانع",
    "السعودية",
    "الشراء الجماعي",
    "تبادل المعدات",
    "الطاقة الإنتاجية",
    "سابك",
    "معادن",
    "B2B",
  ],
  authors: [{ name: "منصة تآزر الصناعية" }],
  creator: "منصة تآزر الصناعية",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "منصة تآزر الصناعية",
    title: "منصة تآزر الصناعية",
    description: "منصة تربط المصانع السعودية الصغيرة والمتوسطة للشراء الجماعي وتبادل الطاقة الإنتاجية",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة تآزر الصناعية",
    description: "منصة تربط المصانع السعودية الصغيرة والمتوسطة",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#22c55e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-cairo antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
