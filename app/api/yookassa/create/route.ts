import { NextRequest, NextResponse } from 'next/server';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3';

export async function POST(request: NextRequest) {
  try {
    const { amount, testLevel, returnUrl } = await request.json();

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'YooKassa credentials not configured' },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = returnUrl || `${baseUrl}/payment/success`;

    const paymentPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: successUrl,
      },
      capture: true,
      description: `Оплата результатов теста уровня ${testLevel}`,
      metadata: {
        testLevel: testLevel.toString(),
      },
    };

    // ЮKassa требует уникальный ключ для предотвращения дублей
    const idempotenceKey = `${Date.now()}-${Math.random()}`;

    const apiResponse = await fetch(`${YOOKASSA_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`YooKassa API error: ${apiResponse.status} ${errorText}`);
    }

    const paymentResult = await apiResponse.json();

    return NextResponse.json({
      id: paymentResult.id,
      confirmationUrl: paymentResult.confirmation?.confirmation_url,
    });
  } catch (err) {
    console.error('YooKassa create payment error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
