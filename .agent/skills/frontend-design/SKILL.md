---
name: frontend-design
description: Design thinking and decision-making for web UI. Use when designing components, layouts, color schemes, typography, or creating aesthetic interfaces. Teaches principles, not fixed values.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Frontend Design System

---

## 🔴 MANDATORY: Context Loading (Auto-injected)

Before applying this skill, load project context:

1. Read `ARCHITECTURE.md` or `CODEBASE_INDEX.md` — understand current system
2. Check related existing code — `grep` for patterns this skill covers
3. Read `.planning/STATE.md` — understand current project phase
4. `recall()` from Second Brain — past lessons in this domain

> **RULE:** Never apply skill knowledge without checking what the project already does.
> **RULE:** Consistency with existing code > theoretical perfection.

> **Philosophy:** Every pixel has purpose. Restraint is luxury. User psychology drives decisions.
> **Core Principle:** THINK, don't memorize. ASK, don't assume.

---

## 🎯 Selective Reading Rule (MANDATORY)

**Read REQUIRED files always, OPTIONAL only when needed:**

| File                                         | Status          | When to Read                      |
| -------------------------------------------- | --------------- | --------------------------------- |
| [ux-psychology.md](ux-psychology.md)         | 🔴 **REQUIRED** | Always read first!                |
| [color-system.md](color-system.md)           | ⚪ Optional     | Color/palette decisions           |
| [typography-system.md](typography-system.md) | ⚪ Optional     | Font selection/pairing            |
| [visual-effects.md](visual-effects.md)       | ⚪ Optional     | Glassmorphism, shadows, gradients |
| [animation-guide.md](animation-guide.md)     | ⚪ Optional     | Animation needed                  |
| [motion-graphics.md](motion-graphics.md)     | ⚪ Optional     | Lottie, GSAP, 3D                  |
| [decision-trees.md](decision-trees.md)       | ⚪ Optional     | Context templates                 |

> 🔴 **ux-psychology.md = ALWAYS READ. Others = only if relevant.**

---

## 🔧 Runtime Scripts

**Execute these for audits (don't read, just run):**

| Script                | Purpose                             | Usage                                       |
| --------------------- | ----------------------------------- | ------------------------------------------- |
| `scripts/ux_audit.py` | UX Psychology & Accessibility Audit | `python scripts/ux_audit.py <project_path>` |

---

## ⚠️ CRITICAL: ASK BEFORE ASSUMING (MANDATORY)

> **STOP! If the user's request is open-ended, DO NOT default to your favorites.**

### When User Prompt is Vague, ASK:

**Color not specified?** Ask:

> "What color palette do you prefer? (blue/green/orange/neutral/other?)"

**Style not specified?** Ask:

> "What style are you going for? (minimal/bold/retro/futuristic/organic?)"

**Layout not specified?** Ask:

> "Do you have a layout preference? (single column/grid/asymmetric/full-width?)"

### ⛔ DEFAULT TENDENCIES TO AVOID (ANTI-SAFE HARBOR):

| AI Default Tendency             | Why It's Bad                | Think Instead                                       |
| ------------------------------- | --------------------------- | --------------------------------------------------- |
| **Bento Grids (Modern Cliché)** | Used in every AI design     | Why does this content NEED a grid?                  |
| **Hero Split (Left/Right)**     | Predictable & Boring        | How about Massive Typography or Vertical Narrative? |
| **Mesh/Aurora Gradients**       | The "new" lazy background   | What's a radical color pairing?                     |
| **Glassmorphism**               | AI's idea of "premium"      | How about solid, high-contrast flat?                |
| **Deep Cyan / Fintech Blue**    | Safe harbor from purple ban | Why not Red, Black, or Neon Green?                  |
| **"Orchestrate / Empower"**     | AI-generated copywriting    | How would a human say this?                         |
| Dark background + neon glow     | Overused, "AI look"         | What does the BRAND actually need?                  |
| **Rounded everything**          | Generic/Safe                | Where can I use sharp, brutalist edges?             |

> 🔴 **"Every 'safe' structure you choose brings you one step closer to a generic template. TAKE RISKS."**

---

## 0. Brief Inference & Aesthetic Calibration (Dials)

Before touching code or layout, **infer what the user actually wants** to avoid defaulting to a generic aesthetic.

### 0.A Read these signals first:

1. **Page kind** - landing (SaaS/consumer/agency), portfolio, editorial/blog, corporate.
2. **Vibe keywords** - "minimalist", "calm", "Linear-style", "brutalist", "premium consumer", "Apple-y", "playful".
3. **Reference signals** - URLs, screenshots, or competitor brands.
4. **Audience** - B2B technical vs. design-conscious consumer vs. recruiter.
5. **Quiet constraints** - accessibility, regulated industries, or trust-first ecommerce.

### 0.B Output a one-line "Design Read" (MANDATORY)

Before generating any UI code, you MUST output a single line stating:
`"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."`

_Example:_ _"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."_

### 0.C Dial Calibration (The Three Dials)

Based on the design read, configure the three style dials (scale of 1-10) to guide code structure:

- **`DESIGN_VARIANCE`** (1 = Perfect Symmetry, 10 = Artsy Chaos)
- **`MOTION_INTENSITY`** (1 = Static, 10 = Cinematic/Physics)
- **`VISUAL_DENSITY`** (1 = Art Gallery/Airy, 10 = Cockpit/Packed Data)

| Use Case Preset               | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
| ----------------------------- | --------------- | ---------------- | -------------- |
| Landing (SaaS, mainstream)    | 7               | 6                | 4              |
| Landing (Agency / creative)   | 9               | 8                | 3              |
| Landing (Premium consumer)    | 7               | 6                | 3              |
| Portfolio (Designer / studio) | 8               | 7                | 3              |
| Portfolio (Developer)         | 6               | 5                | 4              |
| Editorial / Blog              | 6               | 4                | 3              |
| Public-sector / Gov service   | 3               | 2                | 5              |

---

## 1. Constraint Analysis (ALWAYS FIRST)

Before any design work, ANSWER THESE or ASK USER:

| Constraint   | Question              | Why It Matters              |
| ------------ | --------------------- | --------------------------- |
| **Timeline** | How much time?        | Determines complexity       |
| **Content**  | Ready or placeholder? | Affects layout flexibility  |
| **Brand**    | Existing guidelines?  | May dictate colors/fonts    |
| **Tech**     | What stack?           | Affects capabilities        |
| **Audience** | Who exactly?          | Drives all visual decisions |

### Audience → Design Approach

| Audience        | Think About                         |
| --------------- | ----------------------------------- |
| **Gen Z**       | Bold, fast, mobile-first, authentic |
| **Millennials** | Clean, minimal, value-driven        |
| **Gen X**       | Familiar, trustworthy, clear        |
| **Boomers**     | Readable, high contrast, simple     |
| **B2B**         | Professional, data-focused, trust   |
| **Luxury**      | Restrained elegance, whitespace     |

---

## 2. UX Psychology Principles

### Core Laws (Internalize These)

| Law                 | Principle                         | Application                               |
| ------------------- | --------------------------------- | ----------------------------------------- |
| **Hick's Law**      | More choices = slower decisions   | Limit options, use progressive disclosure |
| **Fitts' Law**      | Bigger + closer = easier to click | Size CTAs appropriately                   |
| **Miller's Law**    | ~7 items in working memory        | Chunk content into groups                 |
| **Von Restorff**    | Different = memorable             | Make CTAs visually distinct               |
| **Serial Position** | First/last remembered most        | Key info at start/end                     |

### Emotional Design Levels

```
VISCERAL (instant)  → First impression: colors, imagery, overall feel
BEHAVIORAL (use)    → Using it: speed, feedback, efficiency
REFLECTIVE (memory) → After: "I like what this says about me"
```

### Trust Building

- Security indicators on sensitive actions
- Social proof where relevant
- Clear contact/support access
- Consistent, professional design
- Transparent policies

---

## 3. Layout Principles

### Golden Ratio (φ = 1.618)

```
Use for proportional harmony:
├── Content : Sidebar = roughly 62% : 38%
├── Each heading size = previous × 1.618 (for dramatic scale)
├── Spacing can follow: sm → md → lg (each × 1.618)
```

### 8-Point Grid Concept

```
All spacing and sizing in multiples of 8:
├── Tight: 4px (half-step for micro)
├── Small: 8px
├── Medium: 16px
├── Large: 24px, 32px
├── XL: 48px, 64px, 80px
└── Adjust based on content density
```

### Key Sizing Principles

| Element           | Consideration                        |
| ----------------- | ------------------------------------ |
| **Touch targets** | Minimum comfortable tap size         |
| **Buttons**       | Height based on importance hierarchy |
| **Inputs**        | Match button height for alignment    |
| **Cards**         | Consistent padding, breathable       |
| **Reading width** | 45-75 characters optimal             |

### 3.B Layout & Section Discipline (Anti-Slop)

- **Hero MUST fit in initial viewport:** Headline max 2 lines on desktop. Subtext max **20 words** and max 3-4 lines. Primary/secondary CTAs must be visible without scroll.
- **Hero Stack Discipline (Max 4 text elements):** Eyebrow OR brand strip (0 or 1) + Headline + Subtext + CTAs. Banned in hero: taglines below CTAs, pricing teasers, trust logo walls. All of these go in sections below.
- **Hero Top Padding Cap:** Hero top padding max `pt-24` (~6rem) at desktop to prevent hero content floating too low.
- **Used by Logo Wall:** Trust logos belong below the hero, never inside it.
- **Bento Grid Cell Count:** Grid has exactly as many cells as content (e.g., 3 items = 3 cells). No blank/empty slots. At least 2-3 cells must have visual variety (image, brand-appropriate pattern, tinted background).
- **Section Layout Repetition Ban:** A page with 8 sections must use at least 4 different layout families. Never repeat the exact same layout (e.g. 3-card columns) sequentially.
- **Zigzag Alternation Cap:** Maximum 2 sections in a row with alternating image+text-split patterns. Break the pattern in the 3rd section.
- **Eyebrow Restraint:** Maximum 1 eyebrow (uppercase tracking mono label) per 3 sections. Do not put an eyebrow above every section header.
- **Split-Header Ban:** Do not use "left big H2 + right small body paragraph" as a section header unless the right column contains an actual visual or interactive element. Stack them vertically instead.
- **Navigation Height & Line Cap:** Navigation must render on a single line on desktop. Max height: 80px (default 64-72px).
- **Mobile Collapse:** For every multi-column layout, declare the `< 768px` fallback explicitly in the same component.

---

## 4. Color Principles

### 60-30-10 Rule

```
60% → Primary/Background (calm, neutral base)
30% → Secondary (supporting areas)
10% → Accent (CTAs, highlights, attention)
```

### Color Psychology (For Decision Making)

| If You Need...     | Consider Hues            | Avoid                 |
| ------------------ | ------------------------ | --------------------- |
| Trust, calm        | Blue family              | Aggressive reds       |
| Growth, nature     | Green family             | Industrial grays      |
| Energy, urgency    | Orange, red              | Passive blues         |
| Luxury, creativity | Deep Teal, Gold, Emerald | Cheap-feeling brights |
| Clean, minimal     | Neutrals                 | Overwhelming color    |

### Selection Process

1. **What's the industry?** (narrows options)
2. **What's the emotion?** (picks primary)
3. **Light or dark mode?** (sets foundation)
4. **ASK USER** if not specified

### 4.B Visual Color Rules (Anti-Slop)

- **The Lila Rule (Anti-Purple Mesh Ban):** Avoid default AI-purple button glows, mesh/aurora backgrounds, or neon gradients unless the brief explicitly demands them. Use neutral bases (Zinc, Slate, Stone) with high-contrast singular accents (Emerald, Deep Rose, Burnt Orange).
- **Color Consistency Lock:** Once an accent color is selected, it must be locked and used consistently across the entire page (e.g., do not mix teals, blues, and roses as CTAs on the same page).
- **Premium-Consumer Palette Ban:** Banned as default background/text palettes for luxury/artisanal/DTC home goods brands: warm beige/cream background (`#f5f1ea`, `#f7f5f1`, etc.) + brass/oxblood accents (`#b08947`, `#9a2436`, etc.) + espresso text.
  - _Alternatives:_ Cold Luxury (silver-grey + chrome + smoke), Forest (deep green + bone + amber), Monochrome + singular saturated pop (off-white + off-black + electric blue/hot pink).

For detailed color theory: [color-system.md](color-system.md)

---

## 5. Typography Principles

### Scale Selection

| Content Type | Scale Ratio | Feel                   |
| ------------ | ----------- | ---------------------- |
| Dense UI     | 1.125-1.2   | Compact, efficient     |
| General web  | 1.25        | Balanced (most common) |
| Editorial    | 1.333       | Readable, spacious     |
| Hero/display | 1.5-1.618   | Dramatic impact        |

### Pairing Concept

```
Contrast + Harmony:
├── DIFFERENT enough for hierarchy
├── SIMILAR enough for cohesion
└── Usually: display + neutral, or serif + sans
```

### Readability Rules

- **Line length**: 45-75 characters optimal
- **Line height**: 1.4-1.6 for body text
- **Contrast**: Check WCAG requirements
- **Size**: 16px+ for body on web

### 5.B Typography Discipline (Anti-Slop)

- **Serif Discipline:** Serif font usage is **highly discouraged** as a default. Only use a serif display font if the brand guidelines explicitly name one, or the vibe is genuinely editorial/heritage. Banned display serifs as defaults: `Fraunces`, `Instrument_Serif`.
- **Italic Descender Clearance:** When display type uses italic words with descender letters (`y, g, j, p, q`), use `leading-[1.1]` minimum and add padding at the bottom (`pb-1`) to prevent clipping.
- **Emphasis Consistency:** Emphasize words in headlines using italic or bold of the _same_ font family. Never mix sans and serif families within a single H1.

For detailed typography: [typography-system.md](typography-system.md)

---

## 6. Visual Effects Principles

### Glassmorphism (When Appropriate)

```
Key properties:
├── Semi-transparent background
├── Backdrop blur
├── Subtle border for definition
└── ⚠️ **WARNING:** Standard blue/white glassmorphism is a modern cliché. Use it radically or not at all.
```

### Shadow Hierarchy

```
Elevation concept:
├── Higher elements = larger shadows
├── Y-offset > X-offset (light from above)
├── Multiple layers = more realistic
└── Dark mode: may need glow instead
```

### Gradient Usage

```
Harmonious gradients:
├── Adjacent colors on wheel (analogous)
├── OR same hue, different lightness
├── Avoid harsh complementary pairs
├── 🚫 **NO Mesh/Aurora Gradients** (floating blobs)
└── VARY from project to project radically
```

For complete effects guide: [visual-effects.md](visual-effects.md)

---

## 7. Animation Principles

### Timing Concept

```
Duration based on:
├── Distance (further = longer)
├── Size (larger = slower)
├── Importance (critical = clear)
└── Context (urgent = fast, luxury = slow)
```

### Easing Selection

| Action   | Easing      | Why                   |
| -------- | ----------- | --------------------- |
| Entering | Ease-out    | Decelerate, settle in |
| Leaving  | Ease-in     | Accelerate, exit      |
| Emphasis | Ease-in-out | Smooth, deliberate    |
| Playful  | Bounce      | Fun, energetic        |

### Performance

- Animate only transform and opacity
- Respect reduced-motion preference
- Test on low-end devices

For animation patterns: [animation-guide.md](animation-guide.md), for advanced: [motion-graphics.md](motion-graphics.md)

---

## 8. "Wow Factor" Checklist

### Premium Indicators

- [ ] Generous whitespace (luxury = breathing room)
- [ ] Subtle depth and dimension
- [ ] Smooth, purposeful animations
- [ ] Attention to detail (alignment, consistency)
- [ ] Cohesive visual rhythm
- [ ] Custom elements (not all defaults)

### Trust Builders

- [ ] Security cues where appropriate
- [ ] Social proof / testimonials
- [ ] Clear value proposition
- [ ] Professional imagery
- [ ] Consistent design language

### Emotional Triggers

- [ ] Hero that evokes intended emotion
- [ ] Human elements (faces, stories)
- [ ] Progress/achievement indicators
- [ ] Moments of delight

---

## 9. Anti-Patterns (What NOT to Do)

### ❌ Lazy Design Indicators

- Default system fonts without consideration
- Stock imagery that doesn't match
- Inconsistent spacing
- Too many competing colors
- Walls of text without hierarchy
- Inaccessible contrast

### ❌ AI Tendency Patterns (AVOID!)

- **Same colors every project**
- **Dark + neon as default**
- **Purple/violet everything (PURPLE BAN ✅)**
- **Bento grids for simple landing pages**
- **Mesh Gradients & Glow Effects**
- **Same layout structure / Vercel clone**
- **Not asking user preferences**

### 🖼️ Image & Visual Asset Strategy (Anti-Slop)

- **Image Generation First:** If any image-generation tool is available, you MUST use it to generate custom assets (hero photos, product shots, texture backgrounds) matching the design read.
- **Real Web Images Second:** Use descriptive seed URLs like `https://picsum.photos/seed/{desc}/{w}/{h}` or Unsplash when generation is unavailable.
- **No Div-based Fake Screenshots:** Banned. Use actual component previews, mock screenshots, or real placeholder images.
- **Logo Wall (Simple Icons):** Use CDNs (`https://cdn.simpleicons.org/{slug}/ffffff`) or SVGs for real brand logos. Do not use plain text wordmarks or add category labels under logos.

### 📋 Interactive UI & Content Density (Anti-Slop)

- **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical push.
- **CTA button wrap ban:** Button text must fit on one line on desktop. Shorten labels or widen the button.
- **No duplicate CTA intent:** Two CTAs with the same intent on one page is banned (e.g. "Get in touch" and "Let's talk"). Use one label per intent.
- **Form/Button Contrast check:** Every input, placeholder, focus ring, and CTA button must pass WCAG AA contrast (4.5:1 min) against the section background.
- **Copy Self-Audit:** Review all generated text for grammatical errors, weird AI metaphors, or robotic copy. Replace with simple human sentences if unsure.
- **Quotes/Testimonials:** Testimonial quote body must be a maximum of 3 lines. Slice or edit the text if it is longer to keep it clean.

### ❌ Dark Patterns (Unethical)

- Hidden costs
- Fake urgency
- Forced actions
- Deceptive UI
- Confirmshaming

---

## 10. Decision Process Summary

```
For EVERY design task:

1. CONSTRAINTS
   └── What's the timeline, brand, tech, audience?
   └── If unclear → ASK

2. CONTENT
   └── What content exists?
   └── What's the hierarchy?

3. STYLE DIRECTION
   └── What's appropriate for context?
   └── If unclear → ASK (don't default!)

4. EXECUTION
   └── Apply principles above
   └── Check against anti-patterns

5. REVIEW
   └── "Does this serve the user?"
   └── "Is this different from my defaults?"
   └── "Would I be proud of this?"
```

---

## Reference Files

For deeper guidance on specific areas:

- [color-system.md](color-system.md) - Color theory and selection process
- [typography-system.md](typography-system.md) - Font pairing and scale decisions
- [visual-effects.md](visual-effects.md) - Effects principles and techniques
- [animation-guide.md](animation-guide.md) - Motion design principles
- [motion-graphics.md](motion-graphics.md) - Advanced: Lottie, GSAP, SVG, 3D, Particles
- [decision-trees.md](decision-trees.md) - Context-specific templates
- [ux-psychology.md](ux-psychology.md) - User psychology deep dive

---

## Related Skills

| Skill                                                          | Phase           | When to Use                                                        |
| -------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| **frontend-design** (this)                                     | 1. THINK        | Before coding — UX psychology, constraints, ask-before-assume      |
| **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)**                 | 2a. GENERATE    | Data-driven design system — 161 rules, 67 styles, 57 font pairings |
| **rico-ui-ux-themes** _(via ui-ux-pro-max)_                    | 2b. REFERENCE   | Clone style from 20 themes (Linear, Stripe...) or any website URL  |
| **rico-design-md** _(via ui-ux-pro-max)_                       | 3a. EXTRACT     | Extract DESIGN.md + tokens from any live website URL               |
| **[design-tokens](../design-tokens/SKILL.md)**                 | 3b. STANDARDIZE | Lint/validate DESIGN.md, export to Tailwind/DTCG                   |
| **[web-design-guidelines](../web-design-guidelines/SKILL.md)** | 5. AUDIT        | After coding — Accessibility, performance, compliance              |

## Full Design Pipeline

```
1. THINK        → frontend-design (UX Psychology, constraints, ask-before-assume)
                                                    ← YOU ARE HERE
2a. GENERATE    → ui-ux-pro-max --design-system     (from scratch: industry data)
2b. REFERENCE   → rico-ui-ux-themes                 (clone: Linear/Stripe/Notion/...)
                  "Make this look like Linear"        or reverse-engineer any URL

3a. EXTRACT     → rico-design-md                    (scrape URL → tokens/DESIGN.md)
                  "rico DESIGN.md https://stripe.com"
3b. STANDARDIZE → design-tokens → DESIGN.md         (lint, WCAG contrast, export)

4. CODE         → Implement using design system
5. AUDIT        → web-design-guidelines review       (a11y, focus states, performance)
```

### Quick Start — Full Pipeline

```bash
# Step 2a: Generate from scratch
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "fintech banking dashboard" --design-system -p "MyApp"

# Step 2b: Clone a reference style (say in chat)
# "Make this look like Linear" / "rico use Notion style"

# Step 3a: Extract tokens from a real website
# "rico DESIGN.md https://stripe.com"

# Step 3b: Validate design tokens
npx @google/design.md lint DESIGN.md
npx @google/design.md export --format css-tailwind DESIGN.md > theme.css

# Step 5: Audit
# → Use web-design-guidelines skill
```

> **Next Step:** Use `ui-ux-pro-max` to generate or reference a design system, then `design-tokens` to standardize.

---

> **Remember:** Design is THINKING, not copying. Every project deserves fresh consideration based on its unique context and users. **Avoid the Modern SaaS Safe Harbor!**

---

## 5. Next.js 16+ Modern Form Patterns

> [!IMPORTANT]
> For Next.js 16+ projects, use the native `next/form` component instead of standard HTML `<form>` for all GET-based search/filter operations.

### The `<Form>` Component Advantage

- **Automatic Client Navigation:** Performs client-side transitions on submit.
- **Progressive Enhancement:** Works even without JavaScript.
- **URL Sync:** Automatically encodes input values into search params.

### Implementation Example (Search Bar)

```tsx
import Form from "next/form";

export default function SearchBar() {
  return (
    <Form action="/search" className="flex gap-2">
      <input name="q" placeholder="Search products..." className="border p-2" />
      <button type="submit">Search</button>
    </Form>
  );
}
```

### When to use `<Form>` vs. standard `<form>`:

- **Use `next/form`** for: Search, Filtering, Sorting, Pagination (GET requests).
- **Use standard `<form>`** for: Mutations, Login, Data Entry (POST requests via Server Actions).
