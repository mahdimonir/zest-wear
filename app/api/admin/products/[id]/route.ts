import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      description,
      price,
      quantity,
      imageUrl,
      category,
      size,
      color,
      hasVariants,
    } = body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageUrl,
        category,
        size,
        color,
        hasVariants,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getPublicIdFromUrl(url: string) {
  if (!url) return null;
  // Cloudinary URL format: .../upload/v<version>/<folder>/<public_id>.<extension>
  // Or: .../upload/<folder>/<public_id>.<extension>
  // We need to extract <folder>/<public_id> or just <public_id>

  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v1614012345/sample.jpg
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const publicId = filenameWithExt.split('.')[0];
    
    // Check if it has a folder (simple assumption: if there are more parts after 'upload' and possibly version)
    // A robust way uses regex on typical Cloudinary URLs
    // Regex matches content after /upload/ and (optionally) v<version>/ up to the extension
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    
    return publicId; // Fallback
  } catch (e) {
    console.error('Error extracting public ID:', e);
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = parseInt(params.id);

    // Get product to find image URL
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (product?.imageUrl) {
      const publicId = getPublicIdFromUrl(product.imageUrl);
      if (publicId) {
        try {
          // Delete image from Cloudinary
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted Cloudinary image: ${publicId}`);
        } catch (cloudinaryError) {
           console.error('Failed to delete image from Cloudinary:', cloudinaryError);
           // Continue deleting product even if image delete fails
        }
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
