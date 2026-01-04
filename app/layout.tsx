import Navbar from "@/components/Navbar";
import UserSync from '@/components/auth/UserSync';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Zest Wear - Premium Fashion Store",
  description: "Discover the latest trends in fashion, electronics, and lifestyle products at Zest Wear. Shop premium quality products with style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserSync />
          <Navbar />
          {children}
          <Toaster position="top-right" richColors offset="80px" />
        </body>
      </html>
    </ClerkProvider>
  )
}