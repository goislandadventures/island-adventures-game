import type { CompanyState } from '../types/models';

const KEY = 'island-adventures-save-v1';

export function saveGame(state: CompanyState): void {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { }
}

export function loadGame(): CompanyState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompanyState;
    return { ...parsed, companyColor: parsed.companyColor || '#f6c453', daysOperated: parsed.daysOperated ?? 0 };
  } catch { return null; }
}
