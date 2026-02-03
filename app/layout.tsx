import { auth } from "@/auth";
import AuthProvider from "@/components/auth/AuthProvider";
import Navbar from "@/components/Navbar";
import WishlistInitializer from "@/components/wishlist/WishlistInitializer";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: `${siteConfig.name} - Premium Fashion Store`,
  description: siteConfig.description,
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;
  let isAdmin = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    isAdmin = user?.role === "ADMIN";
  }
  return (
    <AuthProvider session={session}>
      <WishlistInitializer />
      <html lang="en">
        <body className={inter.className}>
          <Navbar isAdmin={isAdmin} />
          {children}
          <Toaster position="top-right" richColors offset="80px" />
        </body>
      </html>
    </AuthProvider>
  );
}
