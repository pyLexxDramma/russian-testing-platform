export interface Bitrix24Lead {
  name: string;
  email: string;
  phone: string;
  testLevel: number;
  testResult: {
    totalCorrect: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
  };
  abTestGroup: 'free' | 'paid';
}

// Webhook может быть с / или без, с методом или без - нормализуем
function buildBitrixUrl(webhook: string): string {
  if (webhook.endsWith('/')) {
    return `${webhook}crm.lead.add`;
  }
  if (webhook.includes('crm.lead.add')) {
    return webhook;
  }
  return `${webhook}/crm.lead.add`;
}

export async function sendLeadToBitrix24(lead: Bitrix24Lead): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_BITRIX24_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Bitrix24 webhook URL is not configured');
  }

  const apiEndpoint = buildBitrixUrl(webhookUrl);

  const leadData = {
    fields: {
      TITLE: `Лид: Тест уровня ${lead.testLevel}`,
      NAME: lead.name,
      EMAIL: [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }],
      PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
      UF_CRM_TEST_LEVEL: lead.testLevel,
      UF_CRM_TEST_RESULT: `${lead.testResult.totalCorrect}/${lead.testResult.totalQuestions} (${lead.testResult.percentage}%)`,
      UF_CRM_TEST_PASSED: lead.testResult.passed ? 'Да' : 'Нет',
      UF_CRM_AB_TEST_GROUP: lead.abTestGroup === 'free' ? 'Бесплатно' : 'Платно',
    },
  };

  const resp = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  if (!resp.ok) {
    // Битрикс иногда возвращает 200 с ошибкой в теле, но мы проверяем статус
    const errorText = await resp.text().catch(() => resp.statusText);
    throw new Error(`Bitrix24 API error: ${resp.status} ${errorText}`);
  }
}
