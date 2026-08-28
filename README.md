# 🏗️ AI Forge — Autonomous Multi-Agent Ecosystem

> **Từ một ý tưởng thô sơ đến hệ thống phần mềm hoàn chỉnh, được hiện thực hóa bởi một "dàn nhạc" AI tự trị.**

[![Version](https://img.shields.io/badge/version-4.0.4-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Multi-Agent](https://img.shields.io/badge/Architecture-Multi--Agent-orange.svg)]()
[![vbsec](https://img.shields.io/badge/Security-vbsec_21_rules-critical.svg)]()
[![GitNexus](https://img.shields.io/badge/MCP-GitNexus-green.svg)]()
[![Codebase Memory](https://img.shields.io/badge/MCP-Codebase_Memory-blue.svg)]()
[![Open Design](https://img.shields.io/badge/Design-Open_Design_72_Systems-ff69b4.svg)](https://github.com/nexu-io/open-design)
[![Clawpatch](https://img.shields.io/badge/Review-Clawpatch_Proactive-yellow.svg)](https://github.com/openclaw/clawpatch)
[![Google Eng Practices](https://img.shields.io/badge/Review-Google_Eng_Practices-red.svg)](docs/wiki/conventions/code-review.md)
[![Rune Skill Mesh](https://img.shields.io/badge/Mesh-Rune_Skill_Mesh-blueviolet.svg)](https://github.com/rune-kit/rune)
[![Auto Fix](https://img.shields.io/badge/CI-Auto--Fix_via_Codex-blueviolet.svg)]()
[![Telegram](https://img.shields.io/badge/AFK-Telegram_Reports-blue.svg)](https://github.com/thith/teleport)
[![Git Ratchet](https://img.shields.io/badge/Optimizer-Git_Ratchet-green.svg)]()

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

### 2. Thiết kế UI/UX (5-Stage Design Pipeline với tích hợp taste-skill)

Khi yêu cầu làm giao diện, hệ thống kích hoạt chuỗi 5 bước, tự động áp dụng các quy chuẩn chống thiết kế "công thức/rập khuôn" (anti-slop) từ **`taste-skill`**:

| Bước                | Skill                   | Vai trò & Chống thiết kế rập khuôn (taste-skill)                                                                                                                                                                                                                                                               |
| ------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. **THINK**        | `frontend-design`       | Đọc vị brief (**Brief Inference**) → xuất ra dòng **Design Read** bắt buộc và thiết lập bộ 3 tham số (**Three Dials**): Variance, Motion, Density trước khi code.                                                                                                                                              |
| 2a. **GENERATE**    | `ui-ux-pro-max`         | Sinh Design System từ 161 quy tắc ngành (67 styles, 57 fonts). Tránh mặc định dùng font display serif (`Fraunces`, `Instrument_Serif`) hay màu beige/brass cho các brand cao cấp (**Serif/Palette Discipline**). Chặn gradient tím mặc định (**Lila Rule**).                                                   |
| 2b. **REFERENCE**   | `rico-ui-ux-themes`     | Clone style từ 20 themes (Linear, Stripe, Notion...) hoặc bất kỳ URL.                                                                                                                                                                                                                                          |
| 3a. **EXTRACT**     | `rico-design-md`        | Scrape thiết kế từ website → DESIGN.md + tokens.json + Tailwind.                                                                                                                                                                                                                                               |
| 3b. **STANDARDIZE** | `design-tokens`         | Lint, WCAG contrast check, export CSS/Tailwind/DTCG. Tích hợp sẵn 6 theme mẫu chuẩn hóa từ `awesome-design-md` (Stripe, Linear, Vercel, Tailwind, Fintech, Gamify) giúp AI code UI chuẩn thiết kế thương hiệu ngay lập tức.                                                                                    |
| 4. **CODE**         | Agent implement         | Viết code dựa trên design system đã thống nhất. Áp dụng kỷ luật thiết kế: bento grid khít ô (**Bento Cell Rule**), hạn chế nhãn phụ (**Eyebrow Restraint** - max 1 eyebrow/3 sections), tránh đổi hướng liên tục (**Zigzag Alternation Cap** - max 2), không trùng lặp ý đồ CTA (**No Duplicate CTA Intent**). |
| 5. **AUDIT**        | `web-design-guidelines` | Quét accessibility, performance, và chạy **Pre-Delivery Checklist** (kiểm tra contrast WCAG AA, tactile feedback khi active, testimonial tối đa 3 dòng, cấm div screenshot).                                                                                                                                   |

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

### 5. Tối ưu hóa định lượng (Git Ratchet - /optimize)

Khi muốn cải thiện hiệu năng (API latency, Bundle Size), vá lỗi bảo mật sau khi quét, hoặc tinh chỉnh prompts của AI, gõ `/optimize`. AI sẽ kích hoạt cơ chế **Git Ratchet**:

1. **Khởi tạo**: Tạo một nhánh git tạm thời cách ly (`optimize/opt-<timestamp>`) từ HEAD hiện tại và đo baseline metric.
2. **Đề xuất & Thử nghiệm**: AI chỉnh sửa code dựa trên giả thuyết tối ưu hóa.
3. **Đánh giá tự động**: Chạy benchmark và các cổng kiểm định an toàn (linting, tests):
   - Nếu metric tốt hơn và vượt qua toàn bộ tests: Tự động `git commit`.
   - Nếu kết quả thụt lùi (regression) hoặc lỗi: Tự động `git reset --hard` để rollback.
4. **Hợp nhất**: Khi hoàn tất, tự động merge các commit cải tiến vào nhánh chính và xóa nhánh tạm.

### 6. Quét Bảo mật (vbsec — Powered by SePay)

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

### 7. Codebase Intelligence (Khám phá & Bản đồ Mã nguồn)

AI Forge tích hợp đồng thời 2 công cụ MCP mạnh mẽ để phân tích codebase:

- **GitNexus**: Dùng để phân tích rủi ro (Impact Analysis) và luồng thực thi, đảm bảo refactor an toàn trước khi sửa code.
- **Codebase-Memory MCP**: Dùng để search semantic siêu tốc và trích xuất kiến trúc (layers, routes, call graphs) toàn dự án. AI (như Antigravity và Codex) tự động sử dụng công cụ này khi cần tra cứu các hàm, module mà không cần người dùng chỉ định.

### 8. Second Brain (Bộ nhớ Vĩnh cửu)

Sau mỗi phiên, AI tự rút bài học và lưu vào Second Brain (MCP Cloud hoặc local fallback). Phiên sau nó tự nhớ quyết định kiến trúc, bug patterns, deploy issues — không cần nhắc lại.

### 9. AFK Mode — Làm việc khi rời bàn

Gõ **"tele me"** hoặc **"gửi tele khi xong"** — agent sẽ gửi báo cáo ngắn qua Telegram khi task hoàn tất và chờ lệnh tiếp theo từ điện thoại của bạn.

```
🤖 *Gemini on deploy v2.4:*
✅ Tests passed (42/42)
🔒 Security audit: PASS
✅ Deployed to production
⬜ Smoke test pending your review
```

### 10. Triết lý Kỹ thuật (TDD, Clean Code & System Design)

Hệ thống không phụ thuộc vào "cảm hứng" viết code của AI, mà ép buộc chất lượng bằng các rào cản kỹ thuật:

- **TDD & Quality Gates:** Luôn ưu tiên viết Test trước. Lệnh `/code` luôn đi kèm với việc tự động chạy `.agent/scripts/checklist.py` (Lint, TypeCheck, Test, Parity Check).
- **Socratic Gate:** Không bao giờ "code mù". Khi yêu cầu phức tạp, AI dừng lại đặt 3 câu hỏi chiến lược về trade-offs, architecture, và security.
- **The Lazy Senior Dev (Ponytail Pattern):** AI được cấu hình để suy nghĩ qua thang 7 bước, tuyệt đối dùng lại code hoặc native API thay vì tự viết mới, giúp giảm tới 54% lượng code sinh ra.
- **Security Gate:** Trước khi deploy, `/audit` phải trả về verdict PASS hoặc WARN. Verdict FAIL = chặn deploy.
- **Kiến trúc Chuẩn mực:** Bắt buộc dùng `UUID/ULID`, chống N+1 query, và yêu cầu các bản ghi Architecture Decision Records (ADR) trước khi thiết kế hệ thống mới.

### 11. Quản lý Nợ Kỹ Thuật (Technical Debt Ledger) & Context Telemetry

- **Technical Debt Scanner (`scripts/maintenance/debt_scanner.py`):** Tự động truy quét toàn bộ codebase gom các thẻ `FIXME:`, `HACK:`, `TEMP_BYPASS:`, `TODO:`, `MOCK:`, `DEBT:` vào sổ nợ kỹ thuật trung tâm [docs/DEBT_LEDGER.md](docs/DEBT_LEDGER.md). Cờ `--strict` tự động ngăn chặn deploy/merge nếu phát hiện nợ nghiêm trọng vô chủ.
- **Context Telemetry & Handoff Thresholds:** Kiểm soát ngân sách Token theo 3 mức cảnh báo rõ ràng (60% Warning, 75% Auto-Checkpoint & Handoff sang subagent, 85% Critical Barrier) để triệt tiêu hoàn toàn hiện tượng suy giảm trí nhớ (context degradation) và ảo giác (hallucination) trên các task kéo dài.

---

## 🦀 Clawpatch — Proactive Local Review & Patching (Rà soát & vá lỗi chủ động)

Bên cạnh luồng Auto-Fix dựa trên CI (Reactive), AI Forge tích hợp **Clawpatch** để mang lại khả năng rà soát và sửa lỗi chủ động (Proactive) ngay trên môi trường local trước khi commit:

- **Semantic Feature Mapping**: Tự động chia nhỏ và ánh xạ codebase thành các lát cắt tính năng (feature slices) dựa trên cấu trúc thư mục và import graph.
- **Slice-by-Slice Review**: Gửi từng feature slice qua AI provider (mặc định là Codex) để quét sâu tìm lỗi logic, bảo mật, hoặc code smells.
- **Local Fix Loop**: Khi phát hiện lỗi (findings), AI có thể chạy một chu trình sửa lỗi (local fix loop) độc lập để tự động tạo bản vá (patch) lưu trong `.clawpatch/patches/`.
- **An toàn tuyệt đối**: Bản vá được tạo ra không tự động commit/push/merge, Tech Lead có thể tự do review diff trước khi quyết định đưa vào commit bằng các lệnh git tiêu chuẩn.

Lệnh trigger: `/clawpatch` (hoặc chạy trực tiếp `clawpatch review --provider codex --limit 5`).

---

## 🛡️ ClaudeKit Guardrails & Harness Engineering (Bảo vệ Vòng Đời Tự Trị)

AI Forge tích hợp các bộ rào cản kỹ thuật nghiêm ngặt lấy cảm hứng từ đợt nâng cấp lớn của **ClaudeKit**, ép buộc hành vi của AI theo khung tiêu chuẩn chất lượng cao nhằm loại bỏ triệt để lỗi "quá tự tin" (overconfidence) và "context tưởng tượng" (hallucination):

### 1. Scout & Diagnose trước khi Sửa lỗi (`/debug`)

- **Chống đoán bừa**: Agent không được đề xuất hay sửa code trước khi hoàn thành pha trinh sát (Scout). Pha Scout yêu cầu quét lịch sử thay đổi (20 commits gần nhất), phân tích caller/dependent trực tiếp (qua GitNexus), và đối chiếu coding convention trong repo.
- **Fast Debugging Methodology**: Tích hợp các nguyên lý từ "The Art of Debugging" — ép buộc Agent tạo Minimal Reproducible Example (MRE), áp dụng chu trình debug nguyên tử và chiến thuật chia để trị (Bisection).
- **Advanced Debugging Tactics**: Trang bị sẵn skill `advanced-debugging-tactics` cho các bug siêu khó (Silent Failures, memory leaks), sử dụng `strace` và môi trường giả lập. (Xem thêm: [Fast Debugging Playbook](docs/wiki/debugging-playbook/fast-debugging.md))
- **Tự động ngắt khi bế tắc**: Giới hạn tối đa 3 lần thử tự động sửa (Self-Healing). Nếu fail cả 3, Agent phải tự động báo cáo nguyên nhân và trả quyền quyết định cho Tech Lead, cấm đập vá vô tội vạ.
- **Xác minh 6 yếu tố**: Mỗi bản vá hoàn thành phải giải trình rõ: (1) triệu chứng, (2) cách tái hiện, (3) kỳ vọng vs thực tế, (4) nguyên nhân gốc cụ thể, (5) lý do xuất hiện lúc này (Why now), và (6) vùng ảnh hưởng (Blast radius).

### 2. Thiết lập Hợp đồng Phác thảo (`/plan` & `/code`)

- **Plan Contract**: Mọi kế hoạch lập trình phải khai báo rõ 5 thành phần cốt lõi:
  1. _Expected Output_: Định dạng file, UI, hay tài liệu cần đạt.
  2. _Acceptance Criteria (AC)_: Tiêu chí nghiệm thu viết dưới dạng Given-When-Then.
  3. _Scope Boundary_: Giới hạn rõ rệt phần việc KHÔNG đụng đến.
  4. _Non-negotiable Constraints_: Rào cản kỹ thuật (DB, auth, deps, no breaking changes).
  5. _Touchpoints & Impact Map_: Toàn bộ các files/routes/functions bị ảnh hưởng được kiểm chứng trước qua GitNexus MCP.
- **Strict Artifact Gate**: Tự động tạo và kiểm định 5 tệp JSON trạng thái trong `.agent/artifacts/<run-id>/` (`context-snippets.json`, `risk-gate.json`, `verification.json`, `review-decision.json`, `adversarial-validation.json`). Thiếu artifact hoặc điểm review < 3 = tự động khóa luồng hoàn thành.
- **Risk-Based Lanes**: Tự động chấm điểm rủi ro qua Risk Checklist để định tuyến:
  - _Tiny Lane_ (0 điểm): Đi tắt qua `/code --fast` (vẫn bắt buộc TDD và checklist).
  - _Normal Lane_ (1-2 điểm): Đi chuẩn qua `/plan` → `/code`.
  - _High-Risk Lane_ (3+ điểm): Ép buộc `/plan` → `/design` → `/code` → `/audit` và chờ Tech Lead duyệt.

### 3. Phòng thủ Ngụy biện (Rationalization Prevention)

- **Cấm tự bào chữa**: Ép AI phải tự soi chiếu 8 lý do ngụy biện kinh điển (như: "File nhỏ không cần test", "Mock data để chạy sau", "Chỉ là demo UI") trước khi viết code.
- **Adversarial Validation**: Ghi nhận toàn bộ lập luận phản biện vào `adversarial-validation.json` để ngăn chặn hành vi nói dối hoặc tự cho là mình đúng.

---

## 🚀 Cài đặt Nhanh (One-Command Setup)

### Yêu cầu tiên quyết

- **Node.js**: v18+ (khuyến nghị v20 LTS)
- **Package Manager**: `npm` (canonical; uses committed `package-lock.json`)
- **Python**: 3.10+ (cho các scripts phụ trợ)
- **Git**: 2.30+

### 1. Khởi tạo Dự án từ Template

```bash
# Clone template về máy
git clone https://github.com/tanviet12/awf-enterprise-template.git my-project
cd my-project

# Chạy script thiết lập tự động (Windows PowerShell)
.\setup-enterprise.ps1 -ProjectName "my-project"

# Hoặc trên Linux/macOS
bash ./setup-enterprise.sh --project-name my-project
```

Script sẽ tự động:

- ✅ Kiểm tra và cài đặt dependencies (`pnpm install`)
- ✅ Thiết lập Git hooks qua Husky & lint-staged
- ✅ Khởi tạo bộ nhớ Second Brain local
- ✅ Cấu hình môi trường `.env` từ `.env.example`
- ✅ Kiểm tra tính tương thích của hệ thống AI client (Antigravity/Codex/Claude)

---

## 🛠️ Danh mục Workflows & Lệnh Điều Khiển

| Lệnh / Workflow   | Tác dụng chính                                                    |
| ----------------- | ----------------------------------------------------------------- |
| `/ba-pipeline`    | Khảo sát nghiệp vụ, sinh Use Cases & User Stories INVEST          |
| `/brainstorm`     | Thảo luận ý tưởng, phân tích trade-offs và kiến trúc              |
| `/plan`           | Lập kế hoạch chi tiết, định tuyến Risk Lane và tạo Contract       |
| `/design`         | Thiết kế hệ thống: DB Schema, API Contracts, System Architecture  |
| `/code`           | Viết code theo TDD, tuân thủ Clean Code và kích hoạt Orchestrator |
| `/debug`          | Sửa lỗi với quy trình Scout & Diagnose 6 bước, chống phỏng đoán   |
| `/test`           | Chạy kiểm thử tự động (Unit, Integration, E2E)                    |
| `/audit`          | Quét bảo mật toàn diện với `vbsec` (21 rules)                     |
| `/optimize`       | Tối ưu hóa hiệu năng/bảo mật định lượng theo cơ chế Git Ratchet   |
| `/clawpatch`      | Rà soát và tạo bản vá lỗi chủ động theo feature slices            |
| `/setup-services` | Tự động cấu hình GitHub repo, Cloudflare Workers và CI/CD         |
| `/setup-teleport` | Thiết lập cầu nối báo cáo tiến độ qua Telegram khi AFK            |

---

## 👥 Vai trò Đội ngũ AI Agents

| Agent                 | Vai trò chuyên biệt                                                      |
| --------------------- | ------------------------------------------------------------------------ |
| `orchestrator`        | Tổng công trình sư: Phân tích, lập dependency graph, điều phối song song |
| `business-analyst`    | Phân tích nghiệp vụ, chuẩn hóa yêu cầu theo IIBA & INVEST                |
| `system-architect`    | Thiết kế kiến trúc tổng thể, mô hình dữ liệu và API Contracts            |
| `frontend-specialist` | Xây dựng UI/UX với 5-Stage Pipeline, chống thiết kế rập khuôn            |
| `backend-specialist`  | Phát triển API, xử lý nghiệp vụ backend, tối ưu hóa truy vấn CSDL        |
| `security-auditor`    | Quét lỗ hổng bảo mật với `vbsec`, đóng vai Red Team rà soát mã nguồn     |
| `qa-engineer`         | Thiết kế kịch bản kiểm thử, đảm bảo độ bao phủ test theo TDD             |
| `devops-engineer`     | Quản lý hạ tầng, CI/CD pipelines, Docker và deployment scripts           |

---

## 📄 License

Dự án được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.
