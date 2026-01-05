import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'All') {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { uploadImage } from '@/lib/cloudinary';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const category = formData.get('category') as string;
    const hasVariants = formData.get('hasVariants') === 'true';
    const size = formData.getAll('size') as string[];
    const color = formData.getAll('color') as string[];
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
        return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Save file to temp
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, imageFile.name);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Cloudinary
    let imageUrl = '';
    try {
        const uploadResult = await uploadImage(tempFilePath, 'ZestWear/Products');
        imageUrl = uploadResult?.secure_url || '';
    } catch (error) {
        console.error('Cloudinary upload invalid:', error);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
