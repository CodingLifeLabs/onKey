import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Toaster } from "sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnKey — 입주 온보딩",
  description: "원룸/오피스텔 입주 온보딩 SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html
        lang="ko"
        className={`${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
