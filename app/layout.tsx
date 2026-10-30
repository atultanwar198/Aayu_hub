import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aayu Hub — A place to ask",
  description:
    "Ask health questions, explore helpful information, and prepare for a conversation with a healthcare professional.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbfaf7] font-sans text-[#243331] antialiased">
        {children}
      </body>
    </html>
  );
}
