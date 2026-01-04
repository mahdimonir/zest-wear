import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    if (!email) {
      return NextResponse.json({ message: 'No email found' }, { status: 400 });
    }

    // Sync user to database
    await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        name,
      },
      create: {
        clerkId: user.id,
        email,
        name,
        role: 'USER',
      },
    });

    return NextResponse.json({ message: 'User synced successfully' });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
