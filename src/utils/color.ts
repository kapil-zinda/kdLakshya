/**
 * Hex-color helpers for turning an org's arbitrary branding colour into the
 * HSL-triplet custom properties this app's design tokens are defined in
 * (see src/styles/globals.css - "222.2 47.4% 11.2%", no `hsl()` wrapper),
 * plus a foreground colour chosen for contrast rather than assumed.
 *
 * ThemeApplier applied a school's primaryColor as a button background but
 * never chose what text should sit on top of it - a school picking a pale
 * yellow got white button text on a pale yellow button. WCAG 2.1's
 * contrast-ratio formula (relative luminance from sRGB) is used here to
 * pick whichever of near-black or near-white actually reads against the
 * given colour.
 */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeHex(hex: string): string {
  const match = HEX_RE.exec(hex.trim());
  if (!match) return '';
  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return value.toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const int = parseInt(normalized, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Converts an sRGB channel (0-255) to its linear-light value for luminance. */
function linearChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  return (
    0.2126 * linearChannel(r) +
    0.7152 * linearChannel(g) +
    0.0722 * linearChannel(b)
  );
}

/** WCAG contrast ratio between two relative luminances, 1 (none) to 21 (max). */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converts sRGB (0-255 each) to the "H S% L%" triplet format this app's CSS
 * variables use (consumed as `hsl(var(--primary))` etc. in tailwind.config.ts).
 */
function rgbToHslTriplet(r: number, g: number, b: number): string {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;

  if (max === min) {
    return `0 0% ${Math.round(l * 100)}%`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rN:
      h = (gN - bN) / d + (gN < bN ? 6 : 0);
      break;
    case gN:
      h = (bN - rN) / d + 2;
      break;
    default:
      h = (rN - gN) / d + 4;
  }
  h *= 60;

  return `${h.toFixed(1)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Given a school's branding hex colour, returns:
 *  - `value`: that colour as an "H S% L%" triplet, for `--primary` etc.
 *  - `foreground`: near-black or near-white, whichever contrasts better,
 *    as the same triplet format, for `--primary-foreground` etc.
 *
 * Falls back to `fallbackHex` (also converted) when `hex` cannot be parsed -
 * an admin can save a malformed value in school-settings, and this must not
 * throw on it or break the whole page's layout.
 */
export function resolveBrandColor(hex: string, fallbackHex: string) {
  const rgb = hexToRgb(hex) ?? hexToRgb(fallbackHex) ?? [5, 150, 105]; // #059669
  const luminance = relativeLuminance(rgb);

  const white = contrastRatio(luminance, 1);
  const black = contrastRatio(luminance, 0);
  const foreground = white >= black ? '0 0% 100%' : '0 0% 3.9%';

  return {
    value: rgbToHslTriplet(...rgb),
    foreground,
  };
}
