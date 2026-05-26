# 🏗️ AI Forge — Autonomous Multi-Agent Ecosystem

> **Từ một ý tưởng thô sơ đến hệ thống phần mềm hoàn chỉnh, được hiện thực hóa bởi một "dàn nhạc" AI tự trị.**

[![Version](https://img.shields.io/badge/version-4.0.2-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Multi-Agent](https://img.shields.io/badge/Architecture-Multi--Agent-orange.svg)]()
[![vbsec](https://img.shields.io/badge/Security-vbsec_21_rules-critical.svg)]()
[![GitNexus](https://img.shields.io/badge/MCP-GitNexus-green.svg)]()
[![Open Design](https://img.shields.io/badge/Design-Open_Design_72_Systems-ff69b4.svg)](https://github.com/nexu-io/open-design)
[![Clawpatch](https://img.shields.io/badge/Review-Clawpatch_Proactive-yellow.svg)](https://github.com/openclaw/clawpatch)
[![Google Eng Practices](https://img.shields.io/badge/Review-Google_Eng_Practices-red.svg)](docs/wiki/conventions/code-review.md)
[![Rune Skill Mesh](https://img.shields.io/badge/Mesh-Rune_Skill_Mesh-blueviolet.svg)](https://github.com/rune-kit/rune)
[![Auto Fix](https://img.shields.io/badge/CI-Auto--Fix_via_Codex-blueviolet.svg)]()
[![Telegram](https://img.shields.io/badge/AFK-Telegram_Reports-blue.svg)](https://github.com/thith/teleport)

**AI Forge** không phải là một bộ prompt tĩnh. Đây là một **Enterprise AI Development Ecosystem** — nơi các AI agents đảm nhiệm vai trò chuyên biệt (BA, Architect, Frontend, Backend, QA, DevOps, Security) và cộng tác với nhau để xây dựng phần mềm.

Bạn đóng vai **Tech Lead**. Bạn ra chỉ thị. AI tự phân tích, phân công, lập trình song song, tự review, tự fix bug, quét bảo mật, và tự đóng issue. **Hoàn toàn tự động.**

---

## 🔄 Vòng đời Phát triển Phần mềm (End-to-End)

```
/brainstorm → /plan → /design → /code → /test → /audit → /deploy
     💡          📋       🎨       💻       🧪      🔒       🚀
  Ý tưởng    Kế hoạch  Thiết kế   Code    Test   Bảo mật   Ship
```

Mỗi bước trong chuỗi là một workflow có cấu trúc, được trang bị Second Brain (bộ nhớ dài hạn), Self-Healing Loop (tự sửa lỗi), và Teleport Bridge (báo cáo AFK qua Telegram).

---

## 📖 Trải nghiệm làm việc với AI Forge

### 1. Ý tưởng → Kế hoạch (BA Pipeline)

Gõ `/ba-pipeline`. AI (vai trò BA) phỏng vấn bạn vài câu, sau đó tự động viết **Use Cases** chuẩn IIBA → bẻ nhỏ thành **User Stories** chuẩn INVEST → sinh **Kế hoạch thực thi (Plan)** chi tiết. 100% tự động.

### 2. Thiết kế UI/UX (5-Stage Design Pipeline)

Khi yêu cầu làm giao diện, hệ thống kích hoạt chuỗi 5 bước:

| Bước                | Skill                   | Làm gì                                                               |
| ------------------- | ----------------------- | -------------------------------------------------------------------- |
| 1. **THINK**        | `frontend-design`       | UX psychology, constraint analysis, ask-before-assume                |
| 2a. **GENERATE**    | `ui-ux-pro-max`         | Sinh Design System từ 161 quy tắc ngành (67 styles, 57 fonts)        |
| 2b. **REFERENCE**   | `rico-ui-ux-themes`     | Clone style từ 20 themes (Linear, Stripe, Notion...) hoặc bất kỳ URL |
| 3a. **EXTRACT**     | `rico-design-md`        | Scrape thiết kế từ website → DESIGN.md + tokens.json + Tailwind      |
| 3b. **STANDARDIZE** | `design-tokens`         | Lint, WCAG contrast check, export CSS/Tailwind/DTCG                  |
| 4. **CODE**         | Agent implement         | Viết code dựa trên design system đã thống nhất                       |
| 5. **AUDIT**        | `web-design-guidelines` | Quét accessibility, performance sau khi code xong                    |

### 3. Thực thi Song song

**Orchestrator** nhận diện task phức tạp → vẽ dependency graph → spawn nhiều Agent chạy song song:

```
User: "Build a secure login system with dashboard UI"
  ↓
Orchestrator phát hiện: Security + Frontend + Backend (3 domains)
  ↓
Song song:
  Agent 1: security-auditor   → Auth flow design, JWT, RBAC
  Agent 2: backend-specialist → API endpoints, middleware
  Agent 3: frontend-specialist → UI components, dark mode
  ↓
Tổng hợp → Conflict check → Unified response
```

Tiết kiệm đến **72% thời gian** so với xử lý tuần tự.

### 4. Self-Healing Loop

Code chạy test bị lỗi? AI tự đọc log → tự hiểu → tự fix → chạy lại test. Tối đa 3 vòng. Nếu fail → escalate + lưu bài học vào Second Brain.

### 5. Quét Bảo mật (vbsec — Powered by SePay)

Gõ `/audit`. AI kích hoạt **[vbs-scan-security](https://github.com/tanviet12/vbsec)** — bộ quét bảo mật reasoning-first, phát hiện **21 loại lỗ hổng** phổ biến trong code do AI sinh ra:

| #   | Vulnerability           | Severity      |
| --- | ----------------------- | ------------- |
| 1   | `HARDCODED-SECRET`      | CRITICAL      |
| 2   | `SQL-INJECTION`         | CRITICAL      |
| 3   | `XSS`                   | HIGH          |
| 4   | `IDOR`                  | HIGH          |
| 5   | `MASS-ASSIGNMENT`       | CRITICAL      |
| 6   | `COMMAND-INJECTION`     | CRITICAL      |
| 7   | `BROKEN-ACCESS-CONTROL` | CRITICAL      |
| ... | +14 rules nữa           | HIGH—CRITICAL |

**Điểm khác biệt so với scanner thông thường:**

- **Reasoning-first**: Không grep mù — trace data flow từ L1 (user input) → sink, chỉ flag khi thực sự nguy hiểm
- **Auto-scaling**: Repo nhỏ (≤30 files) → inline scan. Repo lớn → tự chia chunk + spawn sub-agents song song
- **Language overlays**: Chuyên sâu cho Go, PHP, TypeScript/JS, Python (framework-specific patterns)
- **Bilingual reports**: Tiếng Việt (mặc định) hoặc English (`lang=en`)

Report được lưu tự động vào `vbsec-reports/scan-<timestamp>.md`.

### 6. Second Brain (Bộ nhớ Vĩnh cửu)

Sau mỗi phiên, AI tự rút bài học và lưu vào Second Brain (MCP Cloud hoặc local fallback). Phiên sau nó tự nhớ quyết định kiến trúc, bug patterns, deploy issues — không cần nhắc lại.

### 7. AFK Mode — Làm việc khi rời bàn

Gõ **"tele me"** hoặc **"gửi tele khi xong"** — agent sẽ gửi báo cáo ngắn qua Telegram khi task hoàn tất và chờ lệnh tiếp theo từ điện thoại của bạn.

```
🤖 *Gemini on deploy v2.4:*
✅ Tests passed (42/42)
🔒 Security audit: PASS
✅ Deployed to production
⬜ Smoke test pending your review
```

### 8. Triết lý Kỹ thuật (TDD, Clean Code & System Design)

Hệ thống không phụ thuộc vào "cảm hứng" viết code của AI, mà ép buộc chất lượng bằng các rào cản kỹ thuật:

- **TDD & Quality Gates:** Luôn ưu tiên viết Test trước. Lệnh `/code` luôn đi kèm với việc tự động chạy `.agent/scripts/checklist.py` (Lint, TypeCheck, Test, Parity Check).
- **Socratic Gate:** Không bao giờ "code mù". Khi yêu cầu phức tạp, AI dừng lại đặt 3 câu hỏi chiến lược về trade-offs, architecture, và security.
- **Security Gate:** Trước khi deploy, `/audit` phải trả về verdict PASS hoặc WARN. Verdict FAIL = chặn deploy.
- **Kiến trúc Chuẩn mực:** Bắt buộc dùng `UUID/ULID`, chống N+1 query, và yêu cầu các bản ghi Architecture Decision Records (ADR) trước khi thiết kế hệ thống mới.

---

## 🦀 Clawpatch — Proactive Local Review & Patching (Rà soát & vá lỗi chủ động)

Bên cạnh luồng Auto-Fix dựa trên CI (Reactive), AI Forge tích hợp **Clawpatch** để mang lại khả năng rà soát và sửa lỗi chủ động (Proactive) ngay trên môi trường local trước khi commit:

- **Semantic Feature Mapping**: Tự động chia nhỏ và ánh xạ codebase thành các lát cắt tính năng (feature slices) dựa trên cấu trúc thư mục và import graph.
- **Slice-by-Slice Review**: Gửi từng feature slice qua AI provider (mặc định là Codex) để quét sâu tìm lỗi logic, bảo mật, hoặc code smells.
- **Local Fix Loop**: Khi phát hiện lỗi (findings), AI có thể chạy một chu trình sửa lỗi (local fix loop) độc lập để tự động tạo bản vá (patch) lưu trong `.clawpatch/patches/`.
- **An toàn tuyệt đối**: Bản vá được tạo ra không tự động commit/push/merge, Tech Lead có thể tự do review diff trước khi quyết định đưa vào commit bằng các lệnh git tiêu chuẩn.

Lệnh trigger: `/clawpatch` (hoặc chạy trực tiếp `clawpatch review --provider codex --limit 5`).

---

## 🔄 AI Review & Auto-Fix Pipeline (Tự động hoàn toàn)

Luồng CI/CD khép kín — từ phát hiện bug đến fix bug, không cần con người can thiệp:

```
┌─── GitHub Actions ─────────────────────────────────────────────────┐
│                                                                     │
│  PR submitted → ai-pr-review.yml                                    │
│    → Gemini quét diff → phát hiện lỗi                              │
│    → Comment review trên PR                                         │
│    → Tạo GitHub Issue (label: auto-fixable, metadata YAML)         │
│                                                                     │
│  auto-fix-issues.yml trigger khi issue được label                   │
│    → Self-hosted runner (máy local)                                 │
│    → Codex CLI chạy TRONG REPO với full context                    │
│    → Codex: đọc file → sửa code → chạy lint → chạy test          │
│    → Commit "Fixes #42" → Push branch → Tạo PR                    │
│    → PR merged → Issue #42 tự đóng → ai-pr-review chạy lại        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**4 GitHub Actions Workflows:**

- `ai-pr-review.yml` — Gemini review code + tạo issues
- `auto-fix-issues.yml` — Codex CLI tự fix issues trên local runner
- `post-merge-followup.yml` — Theo dõi sau merge
- `pr-check.yml` — Kiểm tra cơ bản trước khi review

> **Yêu cầu:** Self-hosted runner cần `npm install -g @openai/codex`

---

## 🤖 20 Agents Chuyên biệt

Orchestrator định tuyến request đến agent phù hợp nhất:

| Agent                    | Domain                      | Song song với           |
| ------------------------ | --------------------------- | ----------------------- |
| `orchestrator`           | Điều phối tổng thể          | —                       |
| `frontend-specialist`    | UI/UX, React, Vue           | backend, test, docs     |
| `backend-specialist`     | API, Node.js, NestJS        | frontend, test, docs    |
| `database-architect`     | Schema, Migration, Query    | frontend, docs          |
| `security-auditor`       | Auth, JWT, vbsec Scanner    | backend, frontend, test |
| `penetration-tester`     | Red team, attack simulation | security                |
| `test-engineer`          | Unit, Integration, E2E      | docs, security          |
| `devops-engineer`        | Docker, CI/CD, PM2          | backend, frontend       |
| `debugger`               | Root cause analysis         | ❌ không song song      |
| `performance-optimizer`  | Profiling, caching          | security, test          |
| `mobile-developer`       | React Native, Flutter       | docs, test              |
| `product-owner`          | Stories, Backlog, AC        | planner                 |
| `project-planner`        | Plan, Timeline, Estimate    | (read-only)             |
| `documentation-writer`   | README, Wiki, ADR           | all (read-only)         |
| `seo-specialist`         | Meta, Core Web Vitals       | frontend                |
| `game-developer`         | Unity, Phaser, Godot        | —                       |
| `code-archaeologist`     | Legacy code analysis        | —                       |
| `explorer-agent`         | Discovery, research         | all (read-only)         |
| `qa-automation-engineer` | Playwright, Cypress         | test                    |
| `product-manager`        | Feature definition          | product-owner           |

---

## 🛠️ 43 Skills Chuyên sâu

Skills là "kiến thức nền" mà agents nạp vào khi cần. Tự động kích hoạt, không cần gọi tay:

**Design & UI:**
`ui-ux-pro-max` · `frontend-design` · `design-tokens` · `web-design-guidelines` · `tailwind-patterns` · `mobile-design` · `open-design-bridge`

**Backend & API:**
`api-patterns` · `nodejs-best-practices` · `database-design` · `python-patterns` · `rust-pro`

**DevOps & Deploy:**
`deployment-procedures` · `server-management` · `bash-linux` · `powershell-windows`

**Testing & Quality:**
`testing-patterns` · `tdd-workflow` · `webapp-testing` · `code-review-checklist`

**Security:**
`vbs-scan-security` · `vulnerability-scanner` · `red-team-tactics`

**Architecture & Planning:**
`system-design` · `plan-writing` · `brainstorming` · `behavioral-modes` · `parallel-agents`

**AI & Memory:**
`auto-memory` · `mcp-builder` · `obsidian-knowledge` · `intelligent-routing`

**BA & Documentation:**
`use-case-writer` · `user-story-ac-writer` · `documentation-templates`

**Specialized:**
`teleport-bridge` · `browser-ops` · `game-development` · `geo-fundamentals` · `seo-fundamentals` · `i18n-localization` · `performance-profiling` · `clean-code`

---

## 🔌 Hỗ trợ Đa AI Nền Tảng

| AI Tool                     | Tương thích | Config File               | Skill Path                  | Điểm mạnh                                                              |
| --------------------------- | ----------- | ------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| **Antigravity 2.0 / CLI**   | 🟢 100%     | `GEMINI.md` + `.mcp.json` | `.agent/skills/`            | Autopilot `/goal`, Cron `/schedule`, Multi-agent parallel coordination |
| **Claude Code (Anthropic)** | 🟢 95%      | `CLAUDE.md`               | `.agent/skills/`            | Logic mạnh, MCP GitNexus, Monitor pattern                              |
| **Codex CLI (OpenAI)**      | 🟢 95%      | `.codex/config.toml`      | `.codex/skills/` (junction) | Sandbox, full-auto fix, CI integration                                 |

> **Quy tắc chung** áp dụng cho tất cả agents: `AGENTS.md`
>
> **Codex compatibility**: `.codex/skills/vbs-scan-security` là junction link trỏ về `.agent/skills/vbs-scan-security` — cùng source, không duplicate.

---

## ✨ Các Trụ cột Công nghệ

| #   | Công nghệ                     | Vai trò                                                           |
| --- | ----------------------------- | ----------------------------------------------------------------- |
| 1   | 🧠 **Orchestrator**           | Single entry point — phân tích, routing, spawn agents song song   |
| 2   | 🎨 **Open Design (MCP)**      | 31 skills + 72 design systems — prototype, deck, marketing, docs  |
| 3   | 🚀 **BA Pipeline**            | `/ba-pipeline` → Use Case → User Story → Plan (tự động hoàn toàn) |
| 4   | 🔒 **vbsec Security Scanner** | `/audit` → 21 vulnerability rules, reasoning-first, bilingual     |
| 5   | 🧬 **GitNexus (MCP)**         | Knowledge Graph codebase — biết blast radius khi refactor         |
| 6   | 📓 **Obsidian Vault**         | `docs/` là mạng lưới tri thức — AI quét `[[concept]]` links       |
| 7   | 💾 **Second Brain**           | Bộ nhớ dài hạn — AI nhớ quyết định kiến trúc qua các phiên        |
| 8   | 🔄 **Self-Healing Loop**      | test → fail → auto-fix (max 3 lần) → remember lesson              |
| 9   | 🤖 **Auto-Fix Pipeline**      | CI phát hiện → Codex fix local → PR → auto-close issue            |
| 10  | 🦀 **Clawpatch Review**       | Quét & vá lỗi chủ động trên local (proactive review)              |
| 11  | 📡 **Teleport Bridge**        | AFK reports qua Telegram — ra lệnh tiếp từ điện thoại             |

---

## 🚀 Khởi động Nhanh

### Yêu cầu

- **Node.js 20+**
- **Python 3.10+** (cho UI/UX search engine & auto-memory scripts)
- **Git**
- **Codex CLI** (cho auto-fix pipeline): `npm install -g @openai/codex`

### Cài đặt

```powershell
# 1. Clone template
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project

# 2. Cài dependencies
npm install

# 3. Chạy setup tự động (GitNexus MCP, credentials template)
.\setup-enterprise.ps1 -ProjectName "my-project"

# 4. Mở IDE
code .
```

### Lệnh đầu tiên

Mở khung chat AI và gõ:

```
/brainstorm    ← thảo luận ý tưởng
/ba-pipeline   ← auto BA (Use Case → Story → Plan)
/plan          ← lên kế hoạch thủ công
```

### Setup tùy chọn

```bash
# Cloud services (GitHub + Cloudflare + CI/CD)
/setup-services

# Telegram AFK reporting
/setup-teleport

# Cấu hình Rune Skill Mesh (Tùy chọn nâng cao)
.\scripts\maintenance\setup-rune.ps1
```

---

## 📚 Danh mục Lệnh Đầy đủ

### AWF Workflows (Project-level)

| Lệnh              | Mô tả                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `/brainstorm`     | Bàn ý tưởng, phân tích nghiệp vụ (Socratic Gate)                      |
| `/ba-pipeline`    | Full-auto BA: Use Case → User Story → Plan                            |
| `/plan`           | Lên kế hoạch, chia task, estimate                                     |
| `/design`         | Thiết kế DB Schema + API + Architecture                               |
| `/code`           | Viết code với TDD + Self-Healing Loop                                 |
| `/code-pro`       | 🚀 Actor-Critic Coding (Codex Plan + Antigravity Code + Codex Review) |
| `/test`           | Sinh test + chạy + auto-fix failures                                  |
| `/audit`          | 🔒 Quét bảo mật (vbsec 21 rules) + code quality                       |
| `/deploy`         | Deploy staging/production với safety checks                           |
| `/debug`          | Systematic debugging (4-phase root cause)                             |
| `/fix-issues`     | Fetch GitHub Issues → fix local → push PR                             |
| `/clawpatch`      | 🦀 Quét & vá lỗi chủ động trên local (Clawpatch)                      |
| `/setup-services` | One-click GitHub + Cloudflare + CI/CD setup                           |
| `/setup-teleport` | Setup Telegram AFK reporting bridge                                   |

### Global AWF Commands

| Lệnh          | Mô tả                                    |
| ------------- | ---------------------------------------- |
| `/init`       | Khởi tạo dự án mới                       |
| `/visualize`  | Thiết kế UI/UX mockup (5-stage pipeline) |
| `/review`     | Tổng quan & Bàn giao dự án               |
| `/refactor`   | Tái cấu trúc code                        |
| `/recap`      | Khôi phục context từ phiên trước         |
| `/save-brain` | Lưu kiến thức vào Second Brain           |
| `/rollback`   | Rollback deployment                      |
| `/next`       | Không biết làm gì tiếp? AI đề xuất       |
| `/help`       | Trợ giúp & hướng dẫn                     |
| `/awf-update` | Cập nhật AWF lên phiên bản mới           |

---

## 🔒 Bảo mật & Chất lượng

### Security Gate (vbsec)

Lệnh `/audit` là **cổng bảo mật bắt buộc** trước khi deploy. Sử dụng [vbs-scan-security](https://github.com/tanviet12/vbsec) (MIT License, by SePay & 123HOST):

- **21 rules** bao phủ OWASP Top 10 + các lỗi phổ biến của vibe code (AI-generated code)
- **4 language overlays** chuyên sâu: Go, PHP, TypeScript/JS, Python
- **L1–L4 data flow classification**: Chỉ flag khi dữ liệu không tin cậy (L1 user input) thực sự chạm sink nguy hiểm
- **Auto-scaling**: Repo nhỏ scan inline, repo lớn tự spawn sub-agents song song

**Verdict logic:**

| Kết quả  | Điều kiện                  | Hành động         |
| -------- | -------------------------- | ----------------- |
| **PASS** | Không CRITICAL, không HIGH | ✅ An toàn deploy |
| **WARN** | Có HIGH, không CRITICAL    | ⚠️ Nên fix trước  |
| **FAIL** | Có ≥1 CRITICAL             | 🚫 Chặn deploy    |

### Guardrails Khác

- **Zero-Leakage:** Pre-commit hooks (Husky + lint-staged) chặn API keys và secrets trước khi commit
- **Local Privacy:** GitNexus, Obsidian Graph, Python scripts chạy 100% local — không gửi code lên cloud
- **Strict Boundary:** Orchestrator phân quyền nghiêm ngặt — mỗi agent chỉ sửa file thuộc phạm vi
- **AI Review Guardrail:** Codex chỉ fix khi chạy trong repo context. Nếu fail sau 3 lần → label `needs-human`
- **Teleport Security:** Bot token chỉ lưu trong `../teleport/.env` (ngoài repo, không commit)
- **Production DB:** AI chỉ có quyền READ-ONLY trên production database

### Verification Scripts

```bash
npm run audit           # python .agent/scripts/checklist.py .
npm run verify          # python .agent/scripts/verify_all.py
npm run wiki:lint       # python .agent/scripts/wiki_lint.py
npm run check:env-parity  # kiểm tra env parity giữa các môi trường
```

---

## 📡 AFK Mode — Làm việc khi rời bàn

Khi cần chạy task dài (deploy, fix batch issues, test toàn bộ):

1. Nói với agent: **"tele me"** hoặc **"gửi tele khi xong"**
2. Agent gửi báo cáo ngắn qua bot Telegram khi task hoàn tất
3. Reply từ điện thoại để ra lệnh tiếp

**Agents hỗ trợ:**

- **Antigravity**: Foreground loop + `Agent Non-Workspace File Access` cần bật
- **Claude Code**: Monitor tool (background, `TaskStop` trước khi restart)
- **Codex**: Foreground loop (giống Antigravity)

**Setup lần đầu:**

```
/setup-teleport
```

AI tự clone [thith/teleport](https://github.com/thith/teleport), hướng dẫn tạo bot qua @BotFather, tạo `.env`, và test gửi tin nhắn.

**Trước khi AFK:**

- Bật **Auto Execution → Always Proceed** (Antigravity)
- Bật **Agent Non-Workspace File Access** (Antigravity)
- Giữ máy tính không sleep

---

## 🗂️ Cấu trúc Repo

```
ai-forge/
├── AGENTS.md                    # Quy tắc chung cho tất cả AI agents
├── GEMINI.md                    # Rules riêng cho Antigravity
├── CLAUDE.md                    # Rules riêng cho Claude Code
├── .codex/
│   ├── config.toml              # Config riêng cho Codex CLI
│   └── skills/
│       └── vbs-scan-security/   # Junction → .agent/skills/vbs-scan-security
├── .mcp.json                    # MCP servers (GitNexus + Open Design)
│
├── .agent/
│   ├── agents/                  # 20 agent definitions (orchestrator, frontend, backend...)
│   ├── skills/                  # 43 skills (open-design-bridge, vbs-scan-security, ui-ux-pro-max...)
│   ├── workflows/               # 12 project-level workflows (/code, /audit, /deploy...)
│   ├── scripts/                 # Python helper scripts (checklist, wiki_lint, verify_all)
│   └── rules/                   # Additional AI rules
│
├── .github/workflows/           # 4 GitHub Actions
│   ├── ai-pr-review.yml         # Gemini review + issue creation
│   ├── auto-fix-issues.yml      # Codex auto-fix on self-hosted runner
│   ├── post-merge-followup.yml  # Post-merge checks
│   └── pr-check.yml             # Basic PR validation
│
├── .planning/                   # Project management (STATE.md, ROADMAP, MILESTONES)
├── credentials/                 # Credential templates (NEVER commit real values)
│   ├── credentials.example.toml # All service credentials template
│   ├── telegram.env.example     # Teleport bot config template
│   └── ssh-config.example       # SSH fleet config template
│
├── docs/                        # Obsidian knowledge vault
│   ├── wiki/                    # Wiki articles + lessons learned
│   ├── adr/                     # Architecture Decision Records
│   ├── plans/                   # Task plans (output of /plan)
│   └── wiki-index.md            # Knowledge graph index
│
├── scripts/                     # Operational scripts
│   ├── ci/                      # CI/CD helpers
│   ├── deploy/                  # Deployment scripts
│   ├── maintenance/             # Maintenance scripts
│   ├── qa_tools/                # QA automation tools
│   └── setup/                   # Project setup scripts
│
├── src/                         # Your application code goes here
├── tests/                       # Your tests go here
├── envs/                        # Environment files (gitignored)
├── second-brain/                # Local Second Brain fallback storage
├── vbsec-reports/               # Security scan reports (gitignored)
└── setup-enterprise.ps1         # One-click enterprise setup
```

---

## 🤝 Đóng góp

- Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách tham gia
- Tạo thêm skill: copy `.agent/skills/SKILL_TEMPLATE.md` → tùy chỉnh
- Tạo agent mới: xem `.agent/agents/` để nắm format

---

## 📜 Credits

AI Forge tích hợp và xây dựng trên các dự án mã nguồn mở xuất sắc:

| Skill / Component       | Source                                                                                          | Author                                                                                    | License    |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| **AWF Framework**       | [TUAN130294/awf](https://github.com/TUAN130294/awf)                                             | Phan Anh Tuấn                                                                             | —          |
| `vbs-scan-security`     | [tanviet12/vbsec](https://github.com/tanviet12/vbsec)                                           | Bùi Tấn Việt & Phan Quốc Hiên ([SePay](https://sepay.vn) & [123HOST](https://123host.vn)) | MIT        |
| `open-design-bridge`    | [nexu-io/open-design](https://github.com/nexu-io/open-design)                                   | Nexu Labs                                                                                 | Apache-2.0 |
| `clawpatch`             | [openclaw/clawpatch](https://github.com/openclaw/clawpatch)                                     | OpenClaw Team                                                                             | MIT        |
| **Rune Skill Mesh**     | [rune-kit/rune](https://github.com/rune-kit/rune)                                               | Rune-kit                                                                                  | MIT        |
| `teleport-bridge`       | [thith/teleport](https://github.com/thith/teleport)                                             | thith                                                                                     | —          |
| `ui-ux-pro-max`         | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | nextlevelbuilder                                                                          | —          |
| `ui-ux-pro-max` (Rico)  | [ricocc/rico-skills](https://github.com/ricocc/rico-skills)                                     | ricocc                                                                                    | —          |
| `design-tokens`         | [google-labs-code/design.md](https://github.com/google-labs-code/design.md)                     | Google Labs                                                                               | Apache-2.0 |
| `system-design`         | [karanpratapsingh/system-design](https://github.com/karanpratapsingh/system-design)             | Karan Pratap Singh                                                                        | —          |
| `web-design-guidelines` | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Vercel                                                                                    | —          |
| `use-case-writer`       | [ba-zone](https://github.com/ba-zone)                                                           | Phúc NT @ BA Zone                                                                         | —          |
| `user-story-ac-writer`  | [ba-zone](https://github.com/ba-zone)                                                           | Phúc NT @ BA Zone                                                                         | —          |

---

_Xây dựng với ❤️ — Hãy nhường việc viết code cho AI, và giữ lại phần Kiến trúc cho bạn._
