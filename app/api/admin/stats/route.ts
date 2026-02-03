import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
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
    const [totalProducts, totalOrders, orders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);
    const totalSalesResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    });
    const totalSales = totalSalesResult._sum.total || 0;
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });
    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalSales,
      orders,
      pendingOrders,
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
