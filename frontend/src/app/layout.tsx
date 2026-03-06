import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Survello",
  description: "AI powered document generator",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



const tiempos = localFont({
  src: [
    {
      path: "./fonts/TiemposText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TiemposText-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/TiemposText-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/TiemposText-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/TiemposText-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/TiemposText-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-tiempos",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${tiempos.variable} antialiased`}>
      <body>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

