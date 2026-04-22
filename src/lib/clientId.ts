const STORAGE_KEY = 'soulclaw_client_id';

export function getClientId() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const next = `client_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}
