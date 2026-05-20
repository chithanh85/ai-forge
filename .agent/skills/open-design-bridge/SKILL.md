---
name: open-design-bridge
description: >
  Bridge between AI Forge agents and Open Design (OD) platform.
  Enables AI to create professional design artifacts (UI prototypes, pitch decks,
  marketing assets, business docs) via OD's MCP server — with graceful fallback
  when OD is not installed. Triggers on: design artifact, prototype, mockup,
  pitch deck, slide, presentation, email template, social carousel, landing page,
  dashboard mockup, wireframe, invoice, report template.
triggers:
  - design artifact
  - prototype
  - mockup
  - pitch deck
  - slide
  - presentation
  - email template
  - social carousel
  - landing page design
  - dashboard mockup
  - wireframe
  - invoice template
  - report template
  - weekly update
  - kanban board
  - onboarding flow
---

# Open Design Bridge

> Connect AI Forge's software engineering power with Open Design's artifact-first design platform.

## What is Open Design?

[Open Design](https://github.com/nexu-io/open-design) (OD) is a local-first, open-source design platform (48k+ ⭐). It runs a local daemon that drives AI coding agents to produce **design artifacts** — UI prototypes, pitch decks, marketing assets, business documents — rendered in sandboxed iframes with live preview.

**AI Forge uses OD as a design engine, not a replacement.**

- AI Forge = software engineering (code, test, security, deploy)
- Open Design = design artifacts (prototype, deck, marketing, docs)

---

## Step 1: Detection (Auto — Run Once Per Session)

Before attempting to use OD, detect availability:

```
Check if Open Design MCP is available:
  1. Try calling: mcp_open-design_list_projects()
     → SUCCESS: OD is available. Use MCP path.
     → ERROR/TIMEOUT: OD is NOT available. Use fallback path.
```

### If OD is NOT installed (Fallback)

When Open Design MCP is not available, **gracefully fall back** to AI Forge's built-in design skills:

1. Use `frontend-design` skill for UX analysis
2. Use `ui-ux-pro-max` skill for design system generation
3. Use `design-tokens` skill for token export
4. Use `generate_image` tool for mockup generation
5. Write HTML/CSS prototypes directly

**Inform the user (once per session):**

```
💡 Open Design chưa được cài đặt trên máy này.
Tôi sẽ dùng built-in design skills để tạo prototype.

Để có trải nghiệm design tốt hơn (72 design systems, 31 skills,
live preview, PDF/PPTX export), cài Open Design:
  → https://open-design.ai (desktop app — no setup)
  → hoặc: git clone https://github.com/nexu-io/open-design && pnpm install && pnpm tools-dev run web
```

**Then continue with the built-in skills. Do NOT block the user.**

---

## Step 2: Using Open Design via MCP (When Available)

### 2a. List existing projects

```
mcp_open-design_list_projects()
→ Returns all OD projects on the daemon
```

### 2b. Read a design artifact

```
mcp_open-design_get_artifact(
  project: "project-name",     // optional, defaults to active
  entry: "index.html",         // optional, defaults to active file
  include: "auto"              // auto | all | shallow
)
→ Returns entry file + all referenced files (CSS, JS, images)
```

### 2c. Create a design artifact

```
mcp_open-design_create_artifact(
  name: "landing-page/index.html",
  content: "<html>...</html>",
  project: "my-saas-landing"   // optional
)
→ Creates file in OD project, renders in preview
```

### 2d. Search across design files

```
mcp_open-design_search_files(
  query: "color",
  pattern: "*.css",
  project: "my-project"
)
→ Case-insensitive substring search across all text files
```

### 2e. List all files in a project

```
mcp_open-design_list_files(
  project: "my-project"
)
→ File metadata: name, path, mime, kind, size, mtime
```

---

## Step 3: Design Artifact Types

When user requests a design artifact, map to the appropriate OD skill:

### Prototype mode (web/mobile UI)

| User Intent           | OD Skill            | What it produces               |
| --------------------- | ------------------- | ------------------------------ |
| "Make a landing page" | `saas-landing`      | Full-page HTML with animations |
| "Design a dashboard"  | `dashboard`         | Data-rich dashboard UI         |
| "Mobile app mockup"   | `mobile-app`        | Phone-frame mockup             |
| "Pricing page"        | `pricing-page`      | Tier comparison UI             |
| "Blog layout"         | `blog-post`         | Article page design            |
| "Documentation page"  | `docs-page`         | Technical docs UI              |
| "Wireframe"           | `wireframe-sketch`  | Lo-fi wireframe                |
| "Dating app"          | `dating-web`        | Swipe/match UI                 |
| "Onboarding flow"     | `mobile-onboarding` | Multi-step onboarding          |
| "Gamified app"        | `gamified-app`      | Achievement/reward UI          |
| "Email template"      | `email-marketing`   | Responsive email HTML          |
| "Social media post"   | `social-carousel`   | Carousel/story format          |
| "Magazine poster"     | `magazine-poster`   | Print-style layout             |
| "Animation"           | `motion-frames`     | CSS/JS animation               |
| "Sprite sheet"        | `sprite-animation`  | Frame-by-frame animation       |
| "Digital guide"       | `digital-eguide`    | Interactive guide/ebook        |

### Deck mode (presentations)

| User Intent           | OD Skill        | What it produces                   |
| --------------------- | --------------- | ---------------------------------- |
| "Pitch deck"          | `guizang-ppt`   | Magazine-style slides (WebGL hero) |
| "Simple presentation" | `simple-deck`   | Clean, minimal slides              |
| "Weekly update"       | `weekly-update` | Status report slides               |
| "Team OKRs"           | `team-okrs`     | Objectives tracking                |

### Business documents

| User Intent           | OD Skill         | What it produces     |
| --------------------- | ---------------- | -------------------- |
| "Invoice"             | `invoice`        | Professional invoice |
| "Financial report"    | `finance-report` | Charts + tables      |
| "Meeting notes"       | `meeting-notes`  | Structured notes     |
| "Kanban board"        | `kanban-board`   | Visual task board    |
| "Engineering runbook" | `eng-runbook`    | Ops documentation    |
| "HR onboarding"       | `hr-onboarding`  | New hire guide       |
| "PM spec"             | `pm-spec`        | Product requirements |

---

## Step 4: Design Systems

OD ships 72 brand-grade design systems in `DESIGN.md` format. When creating artifacts:

1. **Ask user** which visual direction they prefer (or let OD's discovery form handle it)
2. **Available systems include**: Linear, Stripe, Vercel, Airbnb, Tesla, Notion, Apple, Anthropic, Cursor, Supabase, Figma, Spotify, Webflow, PostHog, Sentry, MongoDB, Cal.com, and 55+ more
3. **Custom**: User can provide their own DESIGN.md

The design system determines: colors, typography, spacing, layout, components, motion, voice, brand identity, anti-patterns.

---

## Step 5: Workflow Integration

### With `/visualize`

When user runs `/visualize` and OD is available:

1. OD's discovery question form handles the brief (auto — prevents AI freestyle)
2. Agent picks design system + skill based on answers
3. Artifact renders in OD's sandboxed preview
4. User iterates in OD's chat UI
5. Export as HTML / PDF / PPTX / ZIP

### With `/code`

After design is approved in OD:

1. `mcp_open-design_get_artifact()` to read the approved design
2. Extract design tokens, layout structure, component patterns
3. Implement in real framework (React/Next.js/Vue) using `frontend-specialist`
4. This bridges "mockup → production code"

### With `/design`

For technical design (DB schema, API design):

- AI Forge handles this directly (OD is not involved)
- OD only handles visual/UI design artifacts

---

## Anti-Patterns

| ❌ Don't                               | ✅ Do                                     |
| -------------------------------------- | ----------------------------------------- |
| Copy OD skills into `.agent/skills/`   | Use MCP tools to interact with OD daemon  |
| Block user if OD is not installed      | Fall back to built-in design skills       |
| Use OD for code generation             | OD = design artifacts, AI Forge = code    |
| Assume OD is always available          | Always detect first, fallback gracefully  |
| Create artifacts without asking intent | Let OD's discovery form clarify the brief |

---

## Setup Instructions (For Template Users)

### Option A: Desktop App (Recommended — Zero Setup)

Download from [open-design.ai](https://open-design.ai) or [GitHub Releases](https://github.com/nexu-io/open-design/releases).

### Option B: From Source

```bash
git clone https://github.com/nexu-io/open-design.git
cd open-design
corepack enable
pnpm install
pnpm tools-dev run web
```

Requires: Node ~24, pnpm 10.33.x

### Option C: Docker

```bash
git clone https://github.com/nexu-io/open-design.git
cd open-design/deploy
docker compose up -d
# Open http://localhost:7456
```

### MCP Configuration

Add to your IDE's MCP config (e.g., `.mcp.json`, Antigravity settings, or Claude Desktop config):

```json
{
  "mcpServers": {
    "open-design": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/open-design-mcp@latest"]
    }
  }
}
```

Or if running OD daemon locally, point to its MCP endpoint directly.

> **Note**: The MCP server connects to the running OD daemon. The daemon must be running for MCP tools to work.
