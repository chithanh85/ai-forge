---
version: alpha
name: Heritage
description: "Architectural Minimalism meets Journalistic Gravitas"

colors:
  primary: "#1A1C1E"
  primary-60: "#4A4C4E"
  primary-70: "#5A5C5E"
  primary-20: "#E8E8E9"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  tertiary-container: "#D4634F"
  on-tertiary: "#FFFFFF"
  neutral: "#F7F5F2"
  surface: "#FFFFFF"

typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.1em

rounded:
  sm: 4px
  md: 8px

spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px

components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a premium
matte finish — a high-end broadsheet or contemporary gallery. Every element is
intentional; there is no decorative noise.

## Colors

The palette is rooted in high-contrast neutrals and a single accent color.

- **Primary (#1A1C1E):** Deep ink for headlines and core text.
- **Secondary (#6C7278):** Sophisticated slate for borders, captions, metadata.
- **Tertiary (#B8422E):** "Boston Clay" — the sole driver for interaction.
- **Neutral (#F7F5F2):** Warm limestone foundation, softer than pure white.

## Typography

The typography strategy leverages two distinct weights of **Public Sans** for
the narrative and **Space Grotesk** for technical data.

- **Headlines:** Set in Public Sans Semi-Bold to establish an institutional
  and trustworthy voice.
- **Body:** Public Sans Regular at 16px ensures contemporary professionalism
  and long-form readability.
- **Labels:** Space Grotesk is used for all technical data, timestamps, and
  metadata. Its geometric construction evokes the precision of a digital
  stopwatch. Labels are strictly uppercase with generous letter spacing.

## Layout

The layout follows a **Fluid Grid** with maximum content width of 1200px.
A strict 8px spacing scale (with 4px half-step for micro-adjustments) maintains
consistent rhythm.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than heavy shadows. Content
sits on pure white cards against the warm limestone background.

## Shapes

The shape language is defined by **Architectural Sharpness**. All interactive
elements use a minimal **4px corner radius** — modern yet rigid.

## Components

- **Buttons:** Boston Clay (#B8422E) background, white text, 4px radius.
- **Cards:** White surface, subtle 1px secondary border, 8px radius.
- **Inputs:** 1px secondary border, 4px radius, 48px minimum height.

## Do's and Don'ts

- Do use the tertiary color only for the single most important action per screen
- Don't mix rounded and sharp corners in the same view
- Do maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Don't use more than two font weights on a single screen
- Do use Space Grotesk exclusively for data/metadata
- Don't apply shadows — use tonal layers for elevation
