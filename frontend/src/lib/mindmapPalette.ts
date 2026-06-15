import { DEFAULT_NODE_COLOR } from './mindmapPresetColors';

const CUSTOM_STORAGE_KEY = 'itss2-mindmap-custom-colors';
const LEGACY_STORAGE_KEY = 'itss2-mindmap-palette';
const MAX_CUSTOM_COLORS = 20;

export function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase();
  if (!h.startsWith('#')) h = `#${h}`;
  if (/^#[0-9a-f]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h;
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(normalizeHex(hex));
}

export function loadCustomColors(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (
        Array.isArray(parsed) &&
        parsed.every((c) => typeof c === 'string' && isValidHex(c))
      ) {
        return parsed.map(normalizeHex).slice(0, MAX_CUSTOM_COLORS);
      }
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      if (Array.isArray(parsed) && parsed.every((c) => typeof c === 'string' && isValidHex(c))) {
        const migrated = parsed.map(normalizeHex).slice(0, MAX_CUSTOM_COLORS);
        saveCustomColors(migrated);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveCustomColors(colors: string[]): void {
  localStorage.setItem(
    CUSTOM_STORAGE_KEY,
    JSON.stringify(colors.map(normalizeHex).slice(0, MAX_CUSTOM_COLORS))
  );
}

export function addCustomColor(color: string, existing: string[]): string[] {
  const normalized = normalizeHex(color);
  const next = [normalized, ...existing.filter((c) => normalizeHex(c) !== normalized)].slice(
    0,
    MAX_CUSTOM_COLORS
  );
  saveCustomColors(next);
  return next;
}

export { DEFAULT_NODE_COLOR };

/** @deprecated dùng loadCustomColors */
export function loadPalette(): string[] {
  const custom = loadCustomColors();
  return custom.length ? custom : [DEFAULT_NODE_COLOR];
}

/** @deprecated */
export function savePalette(colors: string[]): void {
  saveCustomColors(colors);
}
