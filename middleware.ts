import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    
    // If not signed in, redirect to home
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check for admin role in session claims
    // We expect the role to be synced to publicMetadata (via /api/auth/sync)
    const role = (sessionClaims as unknown as { publicMetadata?: { role?: string } })?.publicMetadata?.role;

    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};