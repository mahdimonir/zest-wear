import { auth } from "@/auth";
import { deleteImageByUrl, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";
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
    const productId = parseInt(params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
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
    const productId = parseInt(params.id);
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const category = formData.get("category") as string;
    const hasVariants = formData.get("hasVariants") === "true";
    const size = formData.getAll("size") as string[];
    const color = formData.getAll("color") as string[];
    const imageFile = formData.get("image") as File | null;
    const imageUrlField = formData.get("imageUrl") as string | null;
    let imageUrl = existingProduct.imageUrl;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, imageFile.name);
      fs.writeFileSync(tempFilePath, buffer);
      try {
        const uploadResult = await uploadImage(
          tempFilePath,
          "ZestWear/Products",
        );
        if (uploadResult?.secure_url) {
          imageUrl = uploadResult.secure_url;
          if (existingProduct.imageUrl) {
            await deleteImageByUrl(existingProduct.imageUrl);
          }
        }
      } catch (error) {
        console.error("Cloudinary upload invalid:", error);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 },
        );
      }
    } else if (imageUrlField === "") {
      imageUrl = "";
      if (existingProduct.imageUrl) {
        await deleteImageByUrl(existingProduct.imageUrl);
      }
    }
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        quantity,
        imageUrl,
        category,
        size,
        color,
        hasVariants,
      },
    });
    const variantImageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("variantImage_"),
    );
    for (const key of variantImageKeys) {
      const colorKey = key.replace("variantImage_", "");
      const file = formData.get(key) as File;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(
          tempDir,
          `variant_${colorKey}_${file.name}`,
        );
        fs.writeFileSync(tempFilePath, buffer);
        try {
          const uploadResult = await uploadImage(
            tempFilePath,
            "ZestWear/Products/Variants",
          );
          if (uploadResult?.secure_url) {
            const existingVarImage = await prisma.productImage.findFirst({
              where: { productId: productId, color: colorKey },
            });
            if (existingVarImage) {
              await deleteImageByUrl(existingVarImage.url);
              await prisma.productImage.update({
                where: { id: existingVarImage.id },
                data: { url: uploadResult.secure_url },
              });
            } else {
              await prisma.productImage.create({
                data: {
                  productId: productId,
                  url: uploadResult.secure_url,
                  color: colorKey,
                },
              });
            }
          }
        } catch (e) {
          console.error(`Failed to upload variant image for ${colorKey}`, e);
        }
      }
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
export async function DELETE(
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
    const productId = parseInt(params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (product?.imageUrl) {
      await deleteImageByUrl(product.imageUrl);
    }
    await prisma.product.delete({
      where: { id: productId },
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
