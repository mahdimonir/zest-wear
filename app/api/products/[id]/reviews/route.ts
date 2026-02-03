import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        : 0;
    return NextResponse.json({
      reviews,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
