---
version: alpha
name: tailwind
description: "A modern, utility-first design specification inspired by Tailwind CSS's own brand aesthetic. Built around a clean canvas (Zinc light / Slate dark), a vibrant Indigo (#6366f1) or Sky (#0ea5e9) primary brand accent, and highly legible typography. This system represents the modern standard for tech startups: fast, clean, high-performance, and responsive. Rounded corners are moderate and smooth, typography pairings lean heavily on Inter, and cards employ subtle shadows with slate hairline dividers."

colors:
  primary: "#6366f1" # Indigo-500
  primary-hover: "#4f46e5" # Indigo-600
  primary-soft: "#e0e7ff" # Indigo-100
  secondary: "#0ea5e9" # Sky-500
  secondary-hover: "#0284c7" # Sky-600
  ink: "#0f172a" # Slate-900
  ink-muted: "#475569" # Slate-600
  ink-subtle: "#94a3b8" # Slate-400
  canvas: "#ffffff" # White
  canvas-soft: "#f8fafc" # Slate-50
  hairline: "#e2e8f0" # Slate-200
  hairline-dark: "#334155" # Slate-700
  success: "#10b981" # Emerald-500
  error: "#ef4444" # Red-500
  warning: "#f59e0b" # Amber-500

typography:
  display-xl:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.015em
  heading-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  heading-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
  body-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.05em
  code:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5

rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px # tailwind-1
  xs: 8px # tailwind-2
  sm: 12px # tailwind-3
  md: 16px # tailwind-4
  lg: 24px # tailwind-6
  xl: 32px # tailwind-8
  xxl: 48px # tailwind-12
  huge: 64px # tailwind-16

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.canvas-soft}"
  card-feature:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  card-feature-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  text-input-focused:
    borderColor: "{colors.primary}"
    ringColor: "{colors.primary-soft}"
  badge-success:
    backgroundColor: "#ecfdf5" # Emerald-50
    textColor: "#065f46" # Emerald-800
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

## Overview

Tailwind style guidelines represent structural clarity, high responsiveness, and clean layout patterns. Built with `Inter` typography, modular spacing, and utility-first layout definitions. It relies on rich, accessible, and balanced palettes (typically Indigo and Slate).

## Colors

- **Primary (#6366f1):** Indigo-500, modern, bright, and vibrant.
- **Ink (#0f172a):** Deep slate blue-gray for ultimate premium typography.
- **Canvas (#ffffff):** White background.
- **Canvas Soft (#f8fafc):** Extremely light gray tint for visual grouping.

## Typography

- **Display & Headlines:** Bold, structured, tight tracking for editorial strength.
- **Body & Captions:** Clean sans-serif with comfortable line height (1.5 - 1.6).

## Spacing & Layout

- Multiples of 4px and 8px to keep strict pixel alignments.
- Large sections use 64px to 96px margins for breathing room.

## Do's and Don'ts

- **Do** use border hairlines in combination with soft gray colors to distinguish different dashboard panels.
- **Don't** mix visual styles: if using round corners (`8px`), apply them consistently across all inputs, badges, and cards.
- **Do** maintain WCAG AA contrast compliance (4.5:1 text-to-background).
