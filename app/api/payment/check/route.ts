import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { testLevel, paymentId } = await request.json();

    if (!testLevel || !paymentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const storagePath = join(process.cwd(), '.payment-storage');
    const fileKey = `payment_${testLevel}_${paymentId}`;
    const filePath = join(storagePath, `${fileKey}.json`);

    if (existsSync(filePath)) {
      // Может быть поврежден JSON, обрабатываем
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        return NextResponse.json({ paid: true, paymentData: data });
      } catch (parseErr) {
        // Файл есть, но битый - считаем не оплаченным
        console.error('Payment file parse error:', parseErr);
        return NextResponse.json({ paid: false });
      }
    }

    return NextResponse.json({ paid: false });
  } catch (err) {
    console.error('Payment check error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
