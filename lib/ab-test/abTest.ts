const STORAGE_GROUP_KEY = 'ab_test_group';
const STORAGE_ENABLED_KEY = 'ab_test_enabled';

export type ABTestGroup = 'free' | 'paid';

export function isABTestEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_ENABLED_KEY);
  // По умолчанию включен, только явный 'false' отключает
  return stored !== 'false';
}

export function setABTestEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
}

export function getABTestGroup(): ABTestGroup {
  if (typeof window === 'undefined') return 'free';
  
  if (!isABTestEnabled()) {
    return 'free';
  }

  const saved = localStorage.getItem(STORAGE_GROUP_KEY);
  
  if (saved === 'free' || saved === 'paid') {
    return saved;
  }

  // 50/50 распределение
  const newGroup: ABTestGroup = Math.random() < 0.5 ? 'free' : 'paid';
  localStorage.setItem(STORAGE_GROUP_KEY, newGroup);
  
  return newGroup;
}

export function setABTestGroup(group: ABTestGroup): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_GROUP_KEY, group);
}

export function shouldShowFreeResults(): boolean {
  if (!isABTestEnabled()) {
    return true;
  }
  
  return getABTestGroup() === 'free';
}
