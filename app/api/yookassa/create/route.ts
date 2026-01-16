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

    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      },
      capture: true,
      description: `Оплата результатов теста уровня ${testLevel}`,
      metadata: {
        testLevel: testLevel.toString(),
      },
    };

    const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': `${Date.now()}-${Math.random()}`,
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YooKassa API error: ${response.status} ${errorText}`);
    }

    const payment = await response.json();

    return NextResponse.json({
      id: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error('YooKassa create payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
