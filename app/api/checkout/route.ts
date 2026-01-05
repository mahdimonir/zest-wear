import { emailService } from '@/lib/email.service';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, total } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get or create user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: shippingAddress.email,
        name: shippingAddress.fullName,
      },
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'PENDING',
        paymentMethod: 'COD',
        shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update product quantities
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    try {
      await emailService.sendOrderCompletedEmail(
        user.email,
        user.name || shippingAddress.fullName || 'Valued Customer',
        {
          orderId: order.id,
          totalPrice: order.total,
          status: order.status,
          itemsCount: order.items.length,
        }
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue execution, don't fail the order
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
