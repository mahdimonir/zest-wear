"use client";
import { useCartStore } from "@/lib/cart-store";
import { siteConfig } from "@/lib/site-config";
import { ShoppingCart, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CustomUserMenu from "./auth/CustomUserMenu";
export default function Navbar({ isAdmin }: { isAdmin?: boolean }) {
  const { data: session, status } = useSession();
  const itemCount = useCartStore((state) => state.getItemCount());
  const isLoading = status === "loading";
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text-light">
              {siteConfig.name}
            </h1>
          </Link>
          {}
          <div className="flex items-center gap-4">
            {}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <CustomUserMenu isAdmin={isAdmin} user={session.user} />
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
