import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

function verifyWebhook(data: string, signature: string): boolean {
  if (!YOOKASSA_SECRET_KEY) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', YOOKASSA_SECRET_KEY)
    .update(data)
    .digest('hex');

  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-yookassa-signature') || '';

    if (!verifyWebhook(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'payment.succeeded') {
      const payment = event.object;
      const testLevel = payment.metadata?.testLevel;

      if (testLevel) {
        const paymentKey = `payment_${testLevel}_${payment.id}`;
        const { writeFileSync, existsSync, mkdirSync } = require('fs');
        const { join } = require('path');
        const storageDir = join(process.cwd(), '.payment-storage');
        if (!existsSync(storageDir)) {
          mkdirSync(storageDir, { recursive: true });
        }
        writeFileSync(join(storageDir, `${paymentKey}.json`), JSON.stringify({
          paymentId: payment.id,
          testLevel: parseInt(testLevel),
          amount: payment.amount.value,
          status: payment.status,
          timestamp: Date.now(),
        }));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('YooKassa webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
