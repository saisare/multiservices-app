import { NextRequest, NextResponse } from 'next/server';

// Mock storage - en production, utiliser S3, Cloudinary, etc.
const uploadedFiles = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File et userId sont obligatoires' },
        { status: 400 }
      );
    }

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format invalide. PNG, JPEG ou WebP seulement' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5MB)' },
        { status: 400 }
      );
    }

    // Convert to base64 for mock storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store in mock storage
    uploadedFiles.set(userId, dataUrl);

    // In production, upload to S3/Cloudinary and store URL in database
    // const url = await uploadToS3(buffer, `avatars/${userId}/${file.name}`);

    return NextResponse.json({
      success: true,
      message: 'Photo uploadée avec succès',
      url: dataUrl // In production: return S3/CDN URL
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    const url = uploadedFiles.get(userId);

    if (!url) {
      return NextResponse.json(
        { error: 'Pas de photo trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
