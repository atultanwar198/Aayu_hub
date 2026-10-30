import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aayu Hub — Patient Portal",
  description: "Sign in or create an account for the Aayu Hub patient portal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1113] font-sans text-[#f4f0e8] antialiased">
        {children}
      </body>
    </html>
  );
}
