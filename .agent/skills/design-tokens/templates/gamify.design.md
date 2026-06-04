---
version: alpha
name: gamify
description: "A vibrant, playful, and highly interactive design system template optimized for gamification, educational tools, community tasks, and reward systems. Anchored on rich, friendly gradients (Vibrant Violet #7c3aed, Neon Pink #ec4899, and Gold Yellow #f59e0b) on a clean, soft canvas (#fafafa). Typography pairings default to friendly, rounded geometric sans-serif faces (e.g., Poppins, Nunito) with extra bold display headings. UI containers feature large corner radii (rounded.lg: 16px, rounded.xl: 24px) and soft 3D border-shadow styles (Neobrutalism or playful offsets) to promote clickability and friendly visual feedback."

colors:
  primary: "#7c3aed" # Vibrant Violet (Primary Accent)
  primary-hover: "#6d28d9"
  primary-soft: "#f3e8ff" # Light purple background
  secondary: "#ec4899" # Neon Pink
  secondary-hover: "#db2777"
  accent-yellow: "#f59e0b" # Gold Yellow for achievements / coins
  accent-orange: "#f97316" # Sunset Orange for level-ups
  ink: "#1e1b4b" # Deep Indigo-Black (friendly dark ink)
  ink-muted: "#4c1d95" # Muted purple-black
  ink-subtle: "#8b5cf6" # Light purple text
  canvas: "#ffffff" # Pure white containers
  canvas-soft: "#fafafa" # Off-white background
  hairline: "#ddd6fe" # Very soft purple hairline
  success: "#10b981" # Active/Complete Green
  error: "#f43f5e" # Playful Rose/Red
  gradient-primary-start: "#7c3aed"
  gradient-primary-end: "#ec4899"
  gradient-reward-start: "#f59e0b"
  gradient-reward-end: "#f97316"

typography:
  display-xl:
    fontFamily: Poppins, Nunito, system-ui, sans-serif
    fontSize: 48px
    fontWeight: 800 # Extra bold for playful focus
    lineHeight: 1.15
    letterSpacing: -0.01em
  display-lg:
    fontFamily: Poppins, Nunito, sans-serif
    fontSize: 34px
    fontWeight: 800
    lineHeight: 1.2
  heading-md:
    fontFamily: Poppins, Nunito, sans-serif
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: Nunito, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.5
  body-md:
    fontFamily: Nunito, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
  body-sm:
    fontFamily: Nunito, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  badge-label:
    fontFamily: Poppins, Nunito, sans-serif
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.05em
  button-md:
    fontFamily: Poppins, Nunito, sans-serif
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1

rounded:
  xs: 6px
  sm: 10px
  md: 14px
  lg: 20px # Large pill style curves
  xl: 28px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 18px
  lg: 26px
  xl: 36px
  xxl: 54px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    boxShadow: "0 4px 0 #6d28d9" # 3D thick push shadow
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-reward:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    boxShadow: "0 4px 0 #b45309"
  card-quest:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    boxShadow: "0 6px 0 {colors.hairline}"
  card-reward-featured:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    borderColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  progress-bar-track:
    backgroundColor: "#e9d5ff" # Lavender-200
    rounded: "{rounded.pill}"
    height: 12px
  progress-bar-fill:
    backgroundColor: "linear-gradient(to right, {colors.gradient-primary-start}, {colors.gradient-primary-end})"
    rounded: "{rounded.pill}"
  badge-level:
    backgroundColor: "{colors.accent-orange}"
    textColor: "{colors.canvas}"
    typography: "{typography.badge-label}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
---

## Overview

Gamification designs focus on capturing user delight, creating clear micro-incentives, and encouraging visual interactions. Buttons feel tactile (featuring 3D push-shadows that shift slightly on click), typography is bold and rounded to feel welcoming, and interfaces display progression status (e.g. progress bars, levels, locked states, unlocked visual rewards) clearly.

## Colors

- **Violet Primary (#7c3aed):** Vibrant, high-energy core color.
- **Neon Pink (#ec4899):** Secondary color, representing actions, triggers, and rewards.
- **Gold Yellow (#f59e0b):** Represents points, achievements, and completion states.
- **Deep Indigo Ink (#1e1b4b):** Warm off-black text, softer and friendlier than pure black.

## Typography

- Bold, energetic headlines. Displays must use thick text weights (700-800) with rounded geometry.
- Text blocks are spaced broadly with generous line heights to avoid feeling technical.

## Do's and Don'ts

- **Do** add playful hover micro-animations (e.g. subtle bounce or scale-up on active icons/cards).
- **Don't** use sharp corners (rounded.none/xs) or boring flat designs; everything must feel tactile and touch-friendly.
- **Do** clearly distinguish completed/unlocked states (vibrant colored cards) from locked states (grayscale/semi-transparent cards).
- **Don't** use more than one complex gradient on the same viewport to avoid overwhelming visual clutter.
