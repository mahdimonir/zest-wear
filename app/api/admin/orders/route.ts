import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }
    // Simple search by ID or customer name (requires joins in Prisma usually, but here relations)
    // Prisma doesn't support easy search on related fields like user.name in a simple `contains` without text search capabilities enabled on DB or using `some`
    // I'll implement simple search if the user asks for it, for now just status filter is easier.
    // Actually, I can search by ID easily.

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        // { user: { name: { contains: search, mode: 'insensitive' } } }, // Requires enabled join filtering, simpler to skip user name search for basic MVP or handle differently.
        // Actually Prisma supports filtering on relations.
         { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
