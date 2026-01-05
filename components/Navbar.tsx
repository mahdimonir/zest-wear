'use client';

import { useCartStore } from '@/lib/cart-store';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { LayoutDashboard, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ isAdmin }: { isAdmin?: boolean }) {
  const { user, isLoaded } = useUser();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text-light">Zest Wear</h1>
          </Link>

          {/* Right side - Cart and Auth */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
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

            {/* Auth Buttons */}
            {!isLoaded ? (
               <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/">
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="My Orders"
                        labelIcon={<ShoppingBag className="w-4 h-4" />}
                        href="/my-orders"
                      />
                      {isAdmin && (
                        <UserButton.Link
                          label="Dashboard"
                          labelIcon={<LayoutDashboard className="w-4 h-4" />}
                          href="/admin"
                        />
                      )}
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
