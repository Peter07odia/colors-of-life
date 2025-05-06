import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Create a canvas to draw a simple placeholder icon
  const canvas = new OffscreenCanvas(144, 144);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return new NextResponse('Could not create canvas context', { status: 500 });
  }
  
  // Fill background with blue
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(0, 0, 144, 144);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('COL', 72, 72);
  
  // Convert to blob
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  
  // Convert blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  
  // Return the image
  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
} 