import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bucketName = process.env.DOCUMENTS_BUCKET_ID;
  const fileName = searchParams.get('fileName');

  if (!bucketName || !fileName) {
    return NextResponse.json(
      { error: 'Bucket name and file name are required' },
      { status: 400 },
    );
  }

  const serviceAccount = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT
    ? JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT)
    : {};

  try {
    const storage = new Storage({
      projectId: process.env.PROJECT_ID,
      credentials: serviceAccount,
    });
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();

    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const readStream = file.createReadStream();

    const chunks = [];

    for await (const chunk of readStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const headers = new Headers({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'application/octet-stream', // Or your specific content type
      'Content-Length': buffer.length.toString(),
    });

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error streaming file:', error);
    return NextResponse.json(
      { error: `Failed to stream file: ${error}` },
      { status: 500 },
    );
  }
}
