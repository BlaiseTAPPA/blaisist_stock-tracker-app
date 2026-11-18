/**
 * Mirror of the colour tokens in `app/globals.css`, for code that can't read
 * CSS variables: TradingView widget configs (the widget renders in a
 * cross-origin iframe) and HTML emails (inline styles only).
 *
 * `globals.css` is the source of truth; `tests/design-tokens.test.ts` fails
 * when the two drift apart.
 */
export const COLORS = {
  surface: "#08090b",
  surfaceRaised: "#1b1d22",
  surfaceHover: "#262930",
  border: "#3a3e48",
  controlBorder: "#737884",
  text: "#eceef1",
  textSecondary: "#c4c8d0",
  textMuted: "#9ca1ac",
  accent: "#e8ba40",
  accentHover: "#f2c94c",
  onAccent: "#08090b",
  gain: "#0fedbe",
  loss: "#ff5c6c",
} as const;

/** CSS variable name of each token in `globals.css`. */
export const CSS_VARIABLES: Record<keyof typeof COLORS, string> = {
  surface: "--surface",
  surfaceRaised: "--surface-raised",
  surfaceHover: "--surface-hover",
  border: "--border",
  controlBorder: "--control-border",
  text: "--text",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
  accent: "--accent",
  accentHover: "--accent-hover",
  onAccent: "--on-accent",
  gain: "--gain",
  loss: "--loss",
};
