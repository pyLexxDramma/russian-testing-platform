import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

function verifyWebhook(data: string, signature: string): boolean {
  if (!YOOKASSA_SECRET_KEY) {
    return false;
  }

  const computedHash = crypto
    .createHmac('sha256', YOOKASSA_SECRET_KEY)
    .update(data)
    .digest('hex');

  return computedHash === signature;
}

function savePaymentData(paymentId: string, testLevel: string, amount: string, status: string): void {
  const storagePath = join(process.cwd(), '.payment-storage');
  if (!existsSync(storagePath)) {
    mkdirSync(storagePath, { recursive: true });
  }

  const fileKey = `payment_${testLevel}_${paymentId}`;
  const filePath = join(storagePath, `${fileKey}.json`);
  
  writeFileSync(filePath, JSON.stringify({
    paymentId,
    testLevel: parseInt(testLevel),
    amount,
    status,
    timestamp: Date.now(),
  }));
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-yookassa-signature') || '';

    if (!verifyWebhook(bodyText, signature)) {
      // ЮKassa может слать тестовые запросы с неправильной подписью
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let webhookData;
    try {
      webhookData = JSON.parse(bodyText);
    } catch (parseErr) {
      // Иногда приходит не JSON
      console.error('Webhook body is not JSON:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (webhookData.event === 'payment.succeeded') {
      const payment = webhookData.object;
      const testLevel = payment.metadata?.testLevel;

      if (testLevel) {
        // Сохраняем даже если что-то пойдет не так дальше
        try {
          savePaymentData(
            payment.id,
            testLevel,
            payment.amount.value,
            payment.status
          );
        } catch (saveErr) {
          // Логируем, но не падаем - ЮKassa уже получил 200
          console.error('Failed to save payment data:', saveErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('YooKassa webhook error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
