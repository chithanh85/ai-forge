---
version: alpha
name: fintech
description: "A secure, authoritative, and high-performance financial interface template. Supports a strict split-theme layout: dark mode for marketing/trading dashboards, and light mode for billing, transactional forms, and account settings. The color scheme is grounded in a deep secure navy/charcoal canvas (#0b0e11 / #ffffff), using a professional Emerald Green (#10b981) for growth/upward trends, a Crimson Red (#ef4444) for risk/downward trends, and a Royal Blue/Gold accent for primary actions. Typography leverages monospaced numbers (tabular figures) for financial figures to align decimal points automatically. Bo-goc (border radius) is kept small and sharp (4px - 8px) to project precision and security."

colors:
  primary: "#2563eb" # Trust Royal Blue (Primary Accent)
  primary-hover: "#1d4ed8"
  primary-soft: "#dbeafe"
  success: "#10b981" # Trading Up (Emerald Green)
  error: "#ef4444" # Trading Down / Risk (Crimson Red)
  warning: "#f59e0b" # Warning (Amber)
  ink: "#0f172a" # Deep Navy/Slate text on light
  ink-light: "#f8fafc" # Off-white text on dark
  ink-muted: "#64748b" # Slate Gray
  canvas: "#ffffff" # Light mode canvas
  canvas-dark: "#0b0e11" # Dark mode trading canvas
  surface: "#f8fafc" # Light elevated surface
  surface-dark: "#1e2329" # Dark elevated card/surface
  hairline: "#e2e8f0" # Light divider
  hairline-dark: "#2b3139" # Dark divider
  on-primary: "#ffffff"

typography:
  display-xl:
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  display-lg:
    fontFamily: -apple-system, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
  heading-md:
    fontFamily: -apple-system, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: -apple-system, sans-serif
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: -apple-system, sans-serif
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  number-display:
    fontFamily: ui-monospace, SFMono-Regular, Consolas, Monaco, monospace
    fontSize: 36px
    fontWeight: 700
    fontFeatureSettings: '"tnum"' # Tabular numbers alignment
  number-md:
    fontFamily: ui-monospace, SFMono-Regular, monospace
    fontSize: 16px
    fontWeight: 500
    fontFeatureSettings: '"tnum"'
  number-sm:
    fontFamily: ui-monospace, SFMono-Regular, monospace
    fontSize: 13px
    fontWeight: 400
    fontFeatureSettings: '"tnum"'
  caption:
    fontFamily: -apple-system, sans-serif
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 0.05em

rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: 40px
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: 40px
  card-balance:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.lg}"
    padding: "24px"
  data-table-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    padding: "12px 16px"
  data-table-row:
    borderColor: "{colors.hairline}"
    padding: "16px"
  price-green-cell:
    textColor: "{colors.success}"
    typography: "{typography.number-md}"
  price-red-cell:
    textColor: "{colors.error}"
    typography: "{typography.number-md}"
---

## Overview

Fintech interfaces demand maximum security, precision, and readability. Visual hierarchy separates read-only status metrics (e.g. balances, rates) from active operations (e.g. send money, buy stocks). Numbers are the core focus, always formatted with tabular monospaced structures (`{typography.number-md}`) to prevent layouts from shifting when figures update.

## Colors

- **Growth Green (#10b981):** Represents positive trends, cash inflows, and successful operations.
- **Risk Red (#ef4444):** Indicates withdrawals, negative balances, or risk warnings.
- **Trust Royal Blue (#2563eb):** The primary color, anchoring identity and primary CTA actions.
- **Slate Navy (#0f172a):** Soft near-black for body copy, preventing visual fatigue.

## Typography

- Pair clean UI sans-serif fonts for controls and labels, with monospaced tabular fonts for numeric figures.
- Use explicit visual contrasts: money values are always bold and sized larger than labels.

## Elevation & Depth

- Low depth, crisp definitions. Use thin 1px borders instead of heavy 3D box-shadows.

## Do's and Don'ts

- **Do** align monetary figures to the right side of tables for easy scan-reading.
- **Don't** use soft/playful typography or overly rounded corners (limit to `6px` or `8px` maximum).
- **Do** provide immediate confirmation and clear feedback states (Success/Error/Warning) for every user interaction.
- **Don't** use decorative color gradients on sensitive data displays. Keep data screens stark and readable.
