---
name: design-tokens
description: "DESIGN.md format specification for structured design systems. Lint, diff, and export design tokens to Tailwind/CSS/DTCG. Use when creating or validating a project's visual identity file."
upstream: https://github.com/google-labs-code/design.md
upstream-version: "0.1.0 (alpha)"
license: Apache-2.0
---

# Design Tokens — DESIGN.md Standard

> Based on [google-labs-code/design.md](https://github.com/google-labs-code/design.md) — a format specification for describing visual identity to coding agents.

---

## 🔴 MANDATORY: Context Loading (Auto-injected)

Before applying this skill, load project context:

1. Read `ARCHITECTURE.md` or `CODEBASE_INDEX.md` — understand current system
2. Check if project already has a `DESIGN.md` — `find . -name "DESIGN.md" -maxdepth 3`
3. Read `.planning/STATE.md` — understand current project phase
4. `recall()` from Second Brain — past design decisions in this project

> **RULE:** Never overwrite an existing DESIGN.md without user confirmation.
> **RULE:** Consistency with existing design > starting from scratch.

---

## 🎯 What is DESIGN.md?

A `DESIGN.md` file combines **machine-readable design tokens** (YAML front matter) with **human-readable design rationale** (markdown prose). Tokens give agents exact values. Prose tells them _why_ those values exist and how to apply them.

```yaml
---
name: Heritage
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
---

## Overview
Architectural Minimalism meets Journalistic Gravitas.

## Colors
- **Primary (#1A1C1E):** Deep ink for headlines.
- **Tertiary (#B8422E):** "Boston Clay" — the sole driver for interaction.
```

---

## 📋 When to Use This Skill

| Trigger                                           | Action                                             |
| ------------------------------------------------- | -------------------------------------------------- |
| User says "create design system"                  | Generate DESIGN.md from ui-ux-pro-max output       |
| User says "validate my design"                    | Run `npx @google/design.md lint DESIGN.md`         |
| User says "export to Tailwind"                    | Run `npx @google/design.md export`                 |
| User says "compare designs"                       | Run `npx @google/design.md diff`                   |
| After `frontend-design` generates a design system | Convert output into DESIGN.md format               |
| Project has no DESIGN.md                          | Suggest creating one from template                 |
| User has a **website URL** to reference           | Use `rico-design-md` to extract → then lint/export |

### 🌐 rico-design-md Integration (URL → DESIGN.md)

If user has a **real website** to reference instead of a keyword query, use `rico-design-md` first:

```bash
# Step 0 (Optional): Extract design from a live website
# Say in chat: "rico DESIGN.md https://linear.app"
#   → Generates themes/linear/DESIGN.md + preview.html

# Then continue standard pipeline:
npx @google/design.md lint themes/linear/DESIGN.md   # Validate
npx @google/design.md export --format css-tailwind themes/linear/DESIGN.md > theme.css
```

**rico-design-md outputs (all go to `themes/{brand}/`):**

| File            | Format      | Use                         |
| --------------- | ----------- | --------------------------- |
| `DESIGN.md`     | Markdown    | Full brand style reference  |
| `preview.html`  | HTML        | Visual offline preview      |
| `tokens.json`   | DTCG        | Style Dictionary compatible |
| `variables.css` | CSS         | Direct import               |
| `theme.css`     | Tailwind v4 | `@theme` block              |

> Full rico-design-md guide in `ui-ux-pro-max` skill.

---

## 🔧 CLI Tools

### Lint — Validate a DESIGN.md

```bash
npx @google/design.md lint DESIGN.md
```

Checks:

- `broken-ref` — detects `{colors.primary}` references to undefined tokens
- `missing-primary` — warns if no `primary` color is defined
- `contrast-ratio` — WCAG contrast check for component `backgroundColor` + `textColor`
- `orphaned-tokens` — tokens defined but never referenced
- `missing-sections` — expected sections not present
- `missing-typography` — no typography tokens found
- `section-order` — sections out of canonical order

### Diff — Compare Two Versions

```bash
npx @google/design.md diff DESIGN.md DESIGN-v2.md
```

Returns token-level changes (added, removed, modified) per token group. Exit code 1 if regressions detected.

### Export — Convert to Other Formats

```bash
# Tailwind v3 config (JSON) — theme.extend object
npx @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json

# Tailwind v4 theme (CSS) — @theme { ... } block
npx @google/design.md export --format css-tailwind DESIGN.md > theme.css

# W3C Design Tokens Format (DTCG)
npx @google/design.md export --format dtcg DESIGN.md > tokens.json
```

### Spec — Output Format Specification

```bash
# Useful for injecting spec context into agent prompts
npx @google/design.md spec
npx @google/design.md spec --rules
```

> ⚠️ **Windows tip:** When invoking from `package.json` scripts, use the `designmd` alias instead of `design.md` to avoid `.md` file association confusion.

---

## 📐 Format Specification

Full spec is in [spec.md](spec.md). Key points:

### File Structure

1. **YAML front matter** — Machine-readable design tokens, delimited by `---`
2. **Markdown body** — Human-readable rationale organized into `##` sections

### Token Schema

```yaml
version: <string> # optional, current: "alpha"
name: <string>
description: <string> # optional
colors:
  <token-name>: <Color> # "#RRGGBB" hex format
typography:
  <token-name>: <Typography> # fontFamily, fontSize, fontWeight, lineHeight, letterSpacing
rounded:
  <scale-level>: <Dimension> # px, em, rem
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <property>: <string | {token.reference}>
```

### Section Order (Canonical)

1. Overview (Brand & Style)
2. Colors
3. Typography
4. Layout (& Spacing)
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

### Component Token Properties

`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`

Variants expressed as separate entries: `button-primary`, `button-primary-hover`, `button-primary-active`

---

## 🔄 Integration with AWF Design Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                   AWF Design Pipeline                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. THINK (frontend-design)                                      │
│     └── UX Psychology, Constraint Analysis, Ask-before-assume    │
│                                                                  │
│  2. GENERATE (ui-ux-pro-max)                                     │
│     └── python scripts/search.py "query" --design-system         │
│                                                                  │
│  3. STANDARDIZE (design-tokens ← YOU ARE HERE)                   │
│     └── Convert output → DESIGN.md format                        │
│     └── npx @google/design.md lint DESIGN.md                     │
│                                                                  │
│  4. EXPORT (design-tokens)                                       │
│     └── npx @google/design.md export --format css-tailwind       │
│                                                                  │
│  5. AUDIT (web-design-guidelines)                                │
│     └── Post-implementation Vercel compliance check              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Converting ui-ux-pro-max Output → DESIGN.md

After running `search.py --design-system`, take the output and structure it:

1. Extract colors → `colors:` YAML section
2. Extract typography → `typography:` YAML section
3. Extract style/effects → `## Overview` prose
4. Extract anti-patterns → `## Do's and Don'ts` prose
5. Lint the result → `npx @google/design.md lint DESIGN.md`

---

## 📁 Templates

- [DESIGN.md.template](templates/DESIGN.md.template) — Blank starter template
- [heritage.design.md](examples/heritage.design.md) — Example: editorial/journalism design

---

## Related Skills

| Skill                                                          | When to Use                                            |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| **[frontend-design](../frontend-design/SKILL.md)**             | Before coding — Learn design principles, UX psychology |
| **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)**                 | Generate design system from industry data              |
| **design-tokens** (this)                                       | Standardize design output into DESIGN.md format        |
| **[web-design-guidelines](../web-design-guidelines/SKILL.md)** | After coding — Audit for accessibility and compliance  |

---

> **Status:** The DESIGN.md format is at version **alpha**. The spec, token schema, and CLI are under active development.
