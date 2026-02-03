import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status as OrderStatus;
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
      }),
      prisma.order.count({ where }),
    ]);
    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
