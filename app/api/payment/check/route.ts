import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { testLevel, paymentId } = await request.json();

    if (!testLevel || !paymentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const storageDir = join(process.cwd(), '.payment-storage');
    const paymentKey = `payment_${testLevel}_${paymentId}`;
    const paymentFile = join(storageDir, `${paymentKey}.json`);

    if (existsSync(paymentFile)) {
      const paymentData = JSON.parse(readFileSync(paymentFile, 'utf-8'));
      return NextResponse.json({ paid: true, paymentData });
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
