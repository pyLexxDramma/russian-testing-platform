import { NextRequest, NextResponse } from 'next/server';
import { sendLeadToBitrix24, Bitrix24Lead } from '@/lib/bitrix24/bitrix24';

export async function POST(request: NextRequest) {
  try {
    const lead: Bitrix24Lead = await request.json();

    await sendLeadToBitrix24(lead);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bitrix24 error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
