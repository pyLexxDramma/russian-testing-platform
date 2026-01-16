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

export async function sendLeadToBitrix24(lead: Bitrix24Lead): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_BITRIX24_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Bitrix24 webhook URL is not configured');
  }

  const apiUrl = webhookUrl.endsWith('/') 
    ? `${webhookUrl}crm.lead.add`
    : webhookUrl.includes('crm.lead.add') 
      ? webhookUrl 
      : `${webhookUrl}/crm.lead.add`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Bitrix24 API error: ${response.statusText}`);
  }
}
