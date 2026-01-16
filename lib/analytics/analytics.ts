declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (counterId: number, method: string, ...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, eventParams?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  const yandexCounterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (window.ym && yandexCounterId) {
    window.ym(parseInt(yandexCounterId), 'reachGoal', eventName, eventParams);
  }
}

export function trackFormSubmit(isPaid: boolean): void {
  trackEvent('form_submit', {
    form_type: isPaid ? 'paid' : 'free',
  });

  if (isPaid) {
    trackEvent('paid_form_submit');
  } else {
    trackEvent('free_form_submit');
  }
}
