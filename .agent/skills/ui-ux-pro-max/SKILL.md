---
name: ui-ux-pro-max
description: UI/UX design intelligence. 50 styles, 21 palettes, 50 font pairings, 20 charts, 9 stacks.
---

# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 13 technology stacks. Searchable database with priority-based recommendations.

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**

```bash
brew install python3
```

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install python3
```

**Windows:**

```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:

- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to `html-tailwind`

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:

1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for hierarchical retrieval across sessions, add `--persist`:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:

- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

**With page-specific override:**

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

This also creates:

- `design-system/pages/dashboard.md` — Page-specific deviations from Master

**How hierarchical retrieval works:**

1. When building a specific page (e.g., "Checkout"), first check `design-system/pages/checkout.md`
2. If the page file exists, its rules **override** the Master file
3. If not, use `design-system/MASTER.md` exclusively

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need                  | Domain       | Example                                 |
| --------------------- | ------------ | --------------------------------------- |
| More style options    | `style`      | `--domain style "glassmorphism dark"`   |
| Chart recommendations | `chart`      | `--domain chart "real-time dashboard"`  |
| UX best practices     | `ux`         | `--domain ux "animation accessibility"` |
| Alternative fonts     | `typography` | `--domain typography "elegant luxury"`  |
| Landing structure     | `landing`    | `--domain landing "hero social-proof"`  |

### Step 4: Stack Guidelines (Default: html-tailwind)

Get implementation-specific best practices. If user doesn't specify a stack, **default to `html-tailwind`**.

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```

Available stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## Search Reference

### Available Domains

| Domain       | Use For                              | Example Keywords                                         |
| ------------ | ------------------------------------ | -------------------------------------------------------- |
| `product`    | Product type recommendations         | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style`      | UI styles, colors, effects           | glassmorphism, minimalism, dark mode, brutalism          |
| `typography` | Font pairings, Google Fonts          | elegant, playful, professional, modern                   |
| `color`      | Color palettes by product type       | saas, ecommerce, healthcare, beauty, fintech, service    |
| `landing`    | Page structure, CTA strategies       | hero, hero-centric, testimonial, pricing, social-proof   |
| `chart`      | Chart types, library recommendations | trend, comparison, timeline, funnel, pie                 |
| `ux`         | Best practices, anti-patterns        | animation, accessibility, z-index, loading               |
| `react`      | React/Next.js performance            | waterfall, bundle, suspense, memo, rerender, cache       |
| `web`        | Web interface guidelines             | aria, focus, keyboard, semantic, virtualize              |
| `prompt`     | AI prompts, CSS keywords             | (style name)                                             |

### Available Stacks

| Stack             | Focus                                                 |
| ----------------- | ----------------------------------------------------- |
| `html-tailwind`   | Tailwind utilities, responsive, a11y (DEFAULT)        |
| `react`           | State, hooks, performance, patterns                   |
| `nextjs`          | SSR, routing, images, API routes                      |
| `vue`             | Composition API, Pinia, Vue Router                    |
| `svelte`          | Runes, stores, SvelteKit                              |
| `swiftui`         | Views, State, Navigation, Animation                   |
| `react-native`    | Components, Navigation, Lists                         |
| `flutter`         | Widgets, State, Layout, Theming                       |
| `shadcn`          | shadcn/ui components, theming, forms, patterns        |
| `jetpack-compose` | Composables, Modifiers, State Hoisting, Recomposition |

---

## Example Workflow

**User request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

### Step 1: Analyze Requirements

- Product type: Beauty/Spa service
- Style keywords: elegant, professional, soft
- Industry: Beauty/Wellness
- Stack: html-tailwind (default)

### Step 2: Generate Design System (REQUIRED)

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
```

**Output:** Complete design system with pattern, style, colors, typography, effects, and anti-patterns.

### Step 3: Supplement with Detailed Searches (as needed)

```bash
# Get UX guidelines for animation and accessibility
python3 skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Get alternative typography options if needed
python3 skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
```

### Step 4: Stack Guidelines

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

**Then:** Synthesize design system + detailed searches and implement the design.

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard" > "app"
2. **Search multiple times** - Different keywords reveal different insights
3. **Combine domains** - Style + Typography + Color = Complete design system
4. **Always check UX** - Search "animation", "z-index", "accessibility" for common issues
5. **Use stack flag** - Get implementation-specific best practices
6. **Iterate** - If first search doesn't match, try different keywords

---

## ⚡ Rico Skills Integration (Extended Design Powers)

> These capabilities extend the core pipeline with **theme cloning**, **one-click optimization**,
> and **design extraction from any website URL**.
> Source: [ricocc/rico-skills](https://github.com/ricocc/rico-skills)

### When to Use Rico vs. Core Pipeline

| Situation                                                 | Use                                         |
| --------------------------------------------------------- | ------------------------------------------- |
| Starting from scratch, need data-driven recommendations   | Core pipeline (`search.py --design-system`) |
| Want to match an existing brand style (Linear, Stripe...) | `rico-ui-ux-themes`                         |
| Have existing code that needs visual polish               | `rico-ui-ux-themes` optimize                |
| Need to extract tokens from a real website URL            | `rico-design-md`                            |
| Need preview.html or DTCG tokens.json from a site         | `rico-design-md`                            |

---

### 🎨 rico-ui-ux-themes — Theme Application & Optimization

**Trigger phrases (natural language, no command needed):**

- "Make this look like Linear / Stripe / Notion / Airbnb"
- "Optimize this website's visual design"
- "Apply Claude style to this page"
- "Generate a theme from apple.com"

Or use explicit commands:

```
rico optimize this website         → 6-dimension analysis + fix
rico use Linear style              → Apply built-in theme
rico create theme: stripe.com      → Reverse-engineer any site → save theme
rico list themes                   → Show all 20 built-in themes
rico combine Linear colors + Notion borders → Mix two themes
```

**20 Built-in Themes (No URL needed):**

| Category        | Themes                                                            |
| --------------- | ----------------------------------------------------------------- |
| Developer Tools | Claude, Minimal Blue, Marketplace Dark, SaaS Dark, Agent Dark     |
| Enterprise      | Professional Blue, Trust Finance, Dashboard Clean                 |
| Creative        | Retro Vibrant, Creative Gallery, Neo-Brutalist, Creative Vitality |
| Audio/Music     | Radio Static, Record Club, Spotify                                |
| E-commerce      | Vibrant Commerce                                                  |
| Brand Style     | Airbnb, Linear, Notion, Duolingo                                  |

**Optimization Workflow (rico optimize):**

```
Read existing code
  ↓
6-Dimension Analysis:
  • Color (contrast, saturation, brand usage)
  • Typography (size, line-height, weight, family)
  • Spacing (grid system, whitespace, density)
  • Border Radius (consistency, style unity)
  • Shadow (weight, consistency, meaning)
  • Interaction (button/link states, animations, feedback)
  ↓
Output optimized code + decisions explained
```

**Natural language fine-tuning (after any rico command):**

```
"Colors too dark"         → AI lightens
"Larger border-radius"    → AI increases
"More compact spacing"    → AI tightens grid
```

**Theme File Structure (14 chapters):**
Each theme doc contains: Design Philosophy → Color System → Interaction Philosophy → Layout → Component Decisions → Application Scenarios → Common Mistakes → Typography Scale → Spacing → Border Radius → Shadows → Component Specs → Animation Specs → Suitable Scenarios.

Generated user themes are saved to: `references/styles/{theme-name}.md`

---

### 📄 rico-design-md — Extract Design System from Any Website

**Trigger phrases:**

- "Create a DESIGN.md for linear.app"
- "Extract design tokens from stripe.com"
- "Analyze GitHub's design system"
- "Generate a preview for apple.com"

Or explicit commands:

```bash
rico DESIGN.md https://linear.app      → DESIGN.md + preview.html (default)
rico tokens https://stripe.com         → tokens.json (DTCG) only
rico variables https://github.com      → variables.css only
rico theme.css https://vercel.com      → Tailwind v4 @theme only
rico 全部输出 github                    → All 5 files
```

**Extraction Workflow:**

```
Input URL
  ↓
Screenshot hero, nav, CTAs, cards, typography, footer
Inspect CSS variables, @font-face, computed styles
  ↓
Extract design tokens:
  • Colors → semantic tokens (canvas, surface-1, ink, accent-blue...)
  • Typography → families, sizes, weights, line-height, letter-spacing
  • Spacing → base unit detection (4px or 8px grid)
  • Radius → xs to full scale
  • Shadows → full CSS syntax
  ↓
Generate output files in themes/{brand-slug}/
```

**Output Files:**

| File            | Format    | Use                                                         |
| --------------- | --------- | ----------------------------------------------------------- |
| `DESIGN.md`     | Markdown  | Full style reference with brand voice, tokens, Do's/Don'ts  |
| `preview.html`  | HTML      | Self-contained visual design system preview (offline-ready) |
| `tokens.json`   | DTCG JSON | Compatible with Style Dictionary + token transformers       |
| `variables.css` | CSS       | CSS custom properties, import directly                      |
| `theme.css`     | CSS       | Tailwind v4 `@theme` block                                  |

**Output location:** `themes/{brand-slug}/` inside the current project.

**Edge Cases:**

- SPA/client-rendered → use view-source + network tab for CSS
- Multi-theme (light/dark) → ask user which to document; offer `dark/` subdirectory
- Auth-gated pages → focus on public marketing pages
- Missing token categories → skip and note gap, never fabricate values

---

### Integration with AWF Design Pipeline

```
1. THINK        → frontend-design principles (UX Psychology, constraints)
2a. GENERATE    → ui-ux-pro-max --design-system (data-driven, from scratch)
2b. REFERENCE   → rico-ui-ux-themes (apply/clone from 20 themes or any URL)   ← NEW
3a. EXTRACT     → rico-design-md (get tokens from real website)                ← NEW
3b. STANDARDIZE → design-tokens → DESIGN.md (lint, validate WCAG)
4. CODE         → Implement using design system
5. AUDIT        → web-design-guidelines review (accessibility, compliance)
```

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule                       | Do                                              | Don't                                  |
| -------------------------- | ----------------------------------------------- | -------------------------------------- |
| **No emoji icons**         | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons   |
| **Stable hover states**    | Use color/opacity transitions on hover          | Use scale transforms that shift layout |
| **Correct brand logos**    | Research official SVG from Simple Icons         | Guess or use incorrect logo paths      |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6          | Mix different icon sizes randomly      |

### Interaction & Cursor

| Rule                   | Do                                                    | Don't                                        |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------- |
| **Cursor pointer**     | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback**     | Provide visual feedback (color, shadow, border)       | No indication element is interactive         |
| **Smooth transitions** | Use `transition-colors duration-200`                  | Instant state changes or too slow (>500ms)   |

### Light/Dark Mode Contrast

| Rule                      | Do                                  | Don't                                   |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent)     |
| **Text contrast light**   | Use `#0F172A` (slate-900) for text  | Use `#94A3B8` (slate-400) for body text |
| **Muted text light**      | Use `#475569` (slate-600) minimum   | Use gray-400 or lighter                 |
| **Border visibility**     | Use `border-gray-200` in light mode | Use `border-white/10` (invisible)       |

### Layout & Spacing

| Rule                     | Do                                  | Don't                                  |
| ------------------------ | ----------------------------------- | -------------------------------------- |
| **Floating navbar**      | Add `top-4 left-4 right-4` spacing  | Stick navbar to `top-0 left-0 right-0` |
| **Content padding**      | Account for fixed navbar height     | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths         |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality & Aesthetics (Anti-Slop)

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Phosphor/Radix/Tabler)
- [ ] Brand logos are correct (verified from Simple Icons CDN)
- [ ] Hover states don't cause layout shift
- [ ] Serif Discipline respected (Fraunces/Instrument_Serif display avoided unless explicitly approved)
- [ ] Premium-consumer beige/brass default palettes avoided unless explicitly approved
- [ ] No default AI-purple mesh gradients or neon glows (Lila Rule)

### Interaction & States

- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Active states have tactile feedback (`-translate-y-[1px]` or `scale-[0.98]`)
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation
- [ ] Button CTA wrap ban respected (no wrapped text)
- [ ] No duplicate CTA intent (exactly 1 label per unique intent)
- [ ] Text contrast on forms and buttons passes WCAG AA (4.5:1 minimum)

### Layout & Composition

- [ ] Hero section fits within initial viewport (Headline max 2 lines, subtext max 20 words, CTAs visible without scroll)
- [ ] Hero top padding max `pt-24` at desktop
- [ ] Eyebrow Restraint: Maximum 1 eyebrow (uppercase tracking mono label) per 3 sections
- [ ] Zigzag Alternation Cap: Maximum 2 consecutive sections with alternating image+text-split patterns
- [ ] Bento Grid Cell Count: No empty cells, 2-3 cells have visual variety (images, patterns, tint)
- [ ] Split-Header Ban: Vertical stacked H2 + body used instead of left-big H2 + right-small explainer (unless right has visual asset)
- [ ] Section Layout Repetition Ban: A page with 8 sections must use at least 4 different layout families
- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Content & Copywriting

- [ ] Quotes & Testimonials: Max 3 lines of quote body (cut if longer)
- [ ] Copy Self-Audit: Re-read all text to ensure no robotic/AI metaphors or passive-aggressive humility
- [ ] No fake-precise numbers (e.g., 92%, 4.1x) unless backed by real data or labeled mock
- [ ] All images have alt text
- [ ] Form inputs have labels above input
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected
