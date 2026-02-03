import { auth } from "@/auth";
import { emailService } from "@/lib/email.service";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { status } = body;
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { user: true },
    });
    try {
      await emailService.sendOrderStatusUpdate(
        user.email,
        user.name || "Valued Customer",
        {
          orderId: order.id,
          status: order.status,
        },
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
