const AB_TEST_KEY = 'ab_test_group';
const AB_TEST_ENABLED_KEY = 'ab_test_enabled';

export type ABTestGroup = 'free' | 'paid';

export function isABTestEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const enabled = localStorage.getItem(AB_TEST_ENABLED_KEY);
  return enabled !== 'false';
}

export function setABTestEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AB_TEST_ENABLED_KEY, enabled.toString());
}

export function getABTestGroup(): ABTestGroup {
  if (typeof window === 'undefined') return 'free';
  
  if (!isABTestEnabled()) {
    return 'free';
  }

  const existingGroup = localStorage.getItem(AB_TEST_KEY) as ABTestGroup | null;
  
  if (existingGroup && (existingGroup === 'free' || existingGroup === 'paid')) {
    return existingGroup;
  }

  const group: ABTestGroup = Math.random() < 0.5 ? 'free' : 'paid';
  localStorage.setItem(AB_TEST_KEY, group);
  
  return group;
}

export function setABTestGroup(group: ABTestGroup): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AB_TEST_KEY, group);
}

export function shouldShowFreeResults(): boolean {
  if (!isABTestEnabled()) {
    return true;
  }
  
  return getABTestGroup() === 'free';
}
