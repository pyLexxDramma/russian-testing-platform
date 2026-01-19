import { NextRequest, NextResponse } from 'next/server';
import { sendLeadToBitrix24, Bitrix24Lead } from '@/lib/bitrix24/bitrix24';

export async function POST(request: NextRequest) {
  try {
    const leadData: Bitrix24Lead = await request.json();

    await sendLeadToBitrix24(leadData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Bitrix24 error:', err);
    // Битрикс иногда падает с таймаутом, но это не критично для пользователя
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    // Возвращаем 200, чтобы не ломать UX - лид все равно попытается отправиться
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 200 }
    );
  }
}
