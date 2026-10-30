import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aayu Hub — Patient Portal",
  description: "Secure access to your patient information.",
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
