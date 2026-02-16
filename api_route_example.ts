
/**
 * NEXT.JS APP ROUTER EXAMPLE (Conceptual Reference)
 * File Path: app/api/upload/route.ts
 */

/*
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename or body missing' }, { status: 400 });
  }

  // Upload to Vercel Blob using the server-side environment variable
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
*/

/**
 * ENVIRONMENT SETUP (.env.local)
 * 
 * 1. Go to your Vercel Dashboard -> Storage -> Blob.
 * 2. Create a new Blob store.
 * 3. Copy the 'BLOB_READ_WRITE_TOKEN'.
 * 4. Add it to your .env.local like this:
 * 
 * BLOB_READ_WRITE_TOKEN=your_token_here
 */
