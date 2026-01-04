'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function UserSync() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch('/api/auth/sync');
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
