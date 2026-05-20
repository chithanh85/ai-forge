---
name: parallel-agents
description: >
  Multi-agent orchestration with TRUE parallel execution.
  Spawn multiple subagents simultaneously to maximize speed.
  Use when independent tasks can run concurrently across different domains.
  Supports: Antigravity (native), Claude Code (Task tool), Codex CLI (sequential fallback).
version: 3.0
---

# Parallel Agents — Tối ưu tốc độ bằng thực thi song song

> **Nguyên tắc cốt lõi**: Nếu 2 task không phụ thuộc nhau → PHẢI chạy song song.
> Đừng bao giờ chạy tuần tự khi có thể chạy đồng thời.

## 🔴 MANDATORY: Context Loading

Trước khi áp dụng skill này:

1. Read `.planning/STATE.md` — trạng thái dự án hiện tại
2. `recall()` từ Second Brain — bài học về orchestration từ quá khứ

> **RULE:** Consistency với code hiện có > lý thuyết hoàn hảo.

---

## Khi nào dùng Parallel Agents?

### ✅ NÊN dùng khi:

- Task có **2+ phần độc lập** (backend + frontend, security + test)
- **Review/Audit đa chiều** (security + performance + code quality)
- **BA Pipeline** — UC viết song song nếu có nhiều UC
- **Feature implementation** — DB schema + API + UI cùng lúc
- **Test generation** — unit test + integration test cùng lúc

### ❌ KHÔNG dùng khi:

- Task đơn giản, single-domain
- Các task có **dependency tuần tự** (phải xong A mới làm B)
- Quick fix, sửa 1 file

---

## Cơ chế Spawn Song Song theo Platform

### Antigravity (Google) — Native Parallel

Antigravity hỗ trợ **spawn song song thật sự** thông qua tool calls.
Khi bạn cần chạy N task song song, hãy gọi N tool calls trong **cùng một block**:

```
Cách thực hiện:
1. Phân tích task → xác định các subtask ĐỘC LẬP
2. Spawn N subagents cùng lúc (parallel tool calls)
3. Mỗi subagent nhận: task description + context riêng
4. Chờ tất cả hoàn thành
5. Tổng hợp (Synthesis) kết quả
```

**Ví dụ — Review code song song:**

```
// Spawn 3 subagents ĐỒng THỜI:
Subagent 1: "🔒 Security — Review authentication flow cho SQL injection, XSS, CSRF"
Subagent 2: "⚡ Performance — Profile API response time, N+1 queries, memory leaks"
Subagent 3: "🧪 Testing — Identify test gaps, generate missing unit tests"

// Kết quả tổng hợp sau khi cả 3 xong
→ Synthesis report với priority: Critical > Important > Nice-to-have
```

### Claude Code (Anthropic) — Task Tool Parallel

Claude Code hỗ trợ song song qua **Task tool** (subagent spawning):

```
Cách thực hiện:
1. Dùng Task tool để spawn subagent
2. Mỗi subagent có isolated context
3. Parent agent aggregate kết quả
```

### Codex CLI (OpenAI) — Sequential Fallback

Codex CLI **chưa hỗ trợ native parallel** — dùng fallback tuần tự:

```
Cách thực hiện:
1. Chạy agent 1 → lưu kết quả
2. Chạy agent 2 → lưu kết quả
3. Tổng hợp tất cả
```

---

## 5 Parallel Patterns (Mẫu thực thi song song)

### Pattern 1: Fan-Out / Fan-In (Phổ biến nhất)

```
         ┌── Agent A (Security) ──┐
Task ──→ ├── Agent B (Backend)  ──┼──→ Synthesis
         └── Agent C (Frontend) ──┘
```

**Dùng khi**: Task có N khía cạnh độc lập cần phân tích/thực thi.

**Hướng dẫn spawn:**

```markdown
## ORCHESTRATOR: Fan-Out / Fan-In

### Bước 1: Phân tích dependency

Liệt kê tất cả subtask. Đánh dấu:

- 🟢 Độc lập (có thể song song)
- 🔴 Phụ thuộc (phải tuần tự)

### Bước 2: Spawn song song các task 🟢

Gọi đồng thời tất cả subagents cho các task 🟢.
Mỗi subagent nhận:

- Task description cụ thể
- Context files cần đọc
- Output format mong muốn
- KHÔNG được sửa file mà subagent khác đang sửa

### Bước 3: Synthesis

Khi tất cả subagent hoàn thành:

- Merge kết quả
- Giải quyết xung đột (nếu có)
- Tạo báo cáo tổng hợp
```

### Pattern 2: Pipeline Song Song (Parallel Pipeline)

```
Phase 1 (song song):  DB Schema ─┬── API Design
Phase 2 (song song):  Backend ───┼── Frontend
Phase 3 (tuần tự):    Integration Test
```

**Dùng khi**: Feature implementation với nhiều tầng. Trong mỗi tầng, các task song song.

### Pattern 3: Competitive Analysis (Đua ngựa)

```
         ┌── Agent A (Approach 1) ──┐
Task ──→ ├── Agent B (Approach 2) ──┼──→ Pick Best
         └── Agent C (Approach 3) ──┘
```

**Dùng khi**: Cần so sánh nhiều giải pháp. Mỗi agent thử một cách tiếp cận khác nhau.

### Pattern 4: Review Council (Hội đồng đánh giá)

```
Code ──→ ┌── Security Auditor ──────┐
         ├── Performance Optimizer ──┼──→ Verdict
         ├── Code Quality Reviewer ──┤
         └── Test Coverage Checker ──┘
```

**Dùng khi**: Code review toàn diện. Mỗi agent review từ góc nhìn chuyên gia riêng.

### Pattern 5: BA Parallel (Use Case song song)

```
Feature ──→ Scope (tuần tự) ──→ UC List
                                  │
                    ┌── UC-01 Writer ──┐
                    ├── UC-02 Writer ──┼──→ Merge All UCs
                    └── UC-03 Writer ──┘
                                  │
                    ┌── US Generator (UC-01) ──┐
                    ├── US Generator (UC-02) ──┼──→ Merge All USs
                    └── US Generator (UC-03) ──┘
```

**Dùng khi**: `/ba-pipeline` với nhiều Use Cases. Sau khi scope xong, viết các UC song song.

---

## Quy tắc An toàn khi Song Song

### 🔴 KHÔNG BAO GIỜ cho phép:

1. **2 subagent sửa cùng 1 file** — sẽ gây conflict
2. **Subagent tạo dependency lẫn nhau** — phải plan trước
3. **Subagent truy cập secret/credential** — chỉ parent agent được phép
4. **Spawn > 5 subagents** cùng lúc — context quá tải, chất lượng giảm

### ✅ LUÔN LUÔN đảm bảo:

1. **Mỗi subagent có phạm vi file riêng** — không overlap
2. **Parent agent kiểm tra conflict** sau khi merge
3. **Timeout** — nếu subagent chạy quá 5 phút → kill và báo cáo
4. **Rollback plan** — nếu merge fail → revert tất cả thay đổi

---

## Dependency Graph — Cách xác định task song song

Trước khi spawn, AI PHẢI vẽ dependency graph:

```markdown
## Dependency Analysis

### Task List:

1. [DB] Tạo migration cho bảng enrollments
2. [API] Viết endpoint POST /api/enrollments
3. [UI] Tạo form đăng ký khóa học
4. [TEST] Viết unit test cho enrollment service
5. [TEST] Viết e2e test cho enrollment flow
6. [DOCS] Viết API documentation

### Dependency Graph:

1 [DB] ──→ 2 [API] ──→ 5 [E2E Test]
│
└──→ 4 [Unit Test]
6 [Docs] ← không phụ thuộc ai
3 [UI] ← không phụ thuộc DB/API (mock data)

### Execution Plan:

Phase 1 (SONG SONG): [1-DB], [3-UI], [6-Docs] ← 3 agents đồng thời
Phase 2 (SONG SONG): [2-API] ← chờ DB xong
Phase 3 (SONG SONG): [4-Unit Test], [5-E2E Test] ← chờ API xong

### Tốc độ:

- Tuần tự: 6 bước × ~3 phút = ~18 phút
- Song song: 3 phases × ~3 phút = ~9 phút (tiết kiệm 50%)
```

---

## Subagent Task Template

Khi spawn subagent, PHẢI cung cấp đầy đủ context:

```markdown
## Subagent Task: {Agent Name}

**Role**: {Chuyên gia domain nào}
**Objective**: {Mục tiêu cụ thể, đo lường được}

**Context Files** (phải đọc trước khi làm):

- {file1.md}
- {file2.ts}

**Scope** (chỉ được thao tác trong phạm vi này):

- Files được phép sửa: {list}
- Files KHÔNG được sửa: {list — subagent khác đang sửa}

**Output Format**:

- {Mô tả output mong muốn}
- Khi xong, trả về: status + summary + files changed

**Constraints**:

- Thời gian tối đa: 5 phút
- KHÔNG được tạo file ngoài phạm vi
- KHÔNG được gọi API/dịch vụ ngoài
```

---

## Tích hợp với Workflows

### Với `/ba-pipeline`:

```
Phase 2 (Use Cases) → Nếu có >= 2 UCs:
  → Spawn N subagents song song, mỗi agent viết 1 UC
  → Merge tất cả → docs/use-cases/

Phase 3 (User Stories) → Nếu có >= 2 UCs:
  → Spawn N subagents song song, mỗi agent tách 1 UC thành USs
  → Merge tất cả → docs/user-stories/
```

### Với `/code`:

```
Nếu plan có >= 2 tasks độc lập trong cùng phase:
  → Spawn subagents song song cho mỗi task
  → Merge + chạy test tổng thể
```

### Với `/test`:

```
  → Spawn song song: unit-test-agent + integration-test-agent + e2e-test-agent
  → Mỗi agent tạo tests cho domain riêng
  → Merge + chạy full suite
```

### Với `/audit`:

```
  → Spawn song song: security-auditor + performance-optimizer + code-reviewer
  → Mỗi agent review từ góc nhìn khác nhau
  → Merge → Verdict report
```

---

## Synthesis Protocol (Giao thức tổng hợp)

Sau khi tất cả subagents hoàn thành, parent agent PHẢI:

```markdown
## 📊 Parallel Execution Report

### Thống kê thực thi

| Subagent         | Thời gian | Status  | Files changed   |
| ---------------- | --------- | ------- | --------------- |
| Security Auditor | 2m 30s    | ✅ Done | 0 (review only) |
| Backend Dev      | 4m 12s    | ✅ Done | 3 files         |
| Frontend Dev     | 3m 45s    | ✅ Done | 5 files         |

### Tốc độ

- Nếu tuần tự: ~10m 27s
- Thực tế (song song): ~4m 12s (bottleneck = Backend Dev)
- **Tiết kiệm: 60%**

### Conflict Check

- [ ] Không có file nào bị sửa bởi 2+ agents
- [ ] Import paths không bị conflict
- [ ] Test vẫn pass sau merge

### Kết quả tổng hợp

{Merge findings từ tất cả agents, sắp xếp theo priority}
```

---

## Available Agents cho Orchestration

| Agent                   | Chuyên môn       | Có thể song song với           |
| ----------------------- | ---------------- | ------------------------------ |
| `security-auditor`      | Bảo mật          | backend, frontend, test        |
| `backend-specialist`    | Backend/API      | frontend, test, docs           |
| `frontend-specialist`   | UI/UX            | backend, test, docs            |
| `database-architect`    | Database/Schema  | frontend, docs                 |
| `test-engineer`         | Testing          | docs, security                 |
| `devops-engineer`       | CI/CD/Deploy     | backend, frontend              |
| `performance-optimizer` | Tối ưu hiệu suất | security, test                 |
| `documentation-writer`  | Tài liệu         | tất cả (không sửa code)        |
| `debugger`              | Sửa lỗi          | ❌ không song song (cần focus) |

---

## Anti-Patterns

| ❌ Đừng làm                   | ✅ Hãy làm                             |
| ----------------------------- | -------------------------------------- |
| Spawn 10 subagents cùng lúc   | Tối đa 4-5 subagents                   |
| Cho 2 agents sửa cùng file    | Phân chia phạm vi file rõ ràng         |
| Bỏ qua dependency analysis    | Luôn vẽ dependency graph trước         |
| Merge mà không check conflict | Chạy test sau mỗi lần merge            |
| Song song mọi thứ             | Chỉ song song các task thực sự độc lập |

---

## 🔴 Agent Boundary Enforcement (CRITICAL)

> Merged từ orchestrator agent — áp dụng cho MỌI hình thức multi-agent.

**Mỗi agent PHẢI giữ đúng phạm vi domain. Làm việc ngoài domain = VI PHẠM.**

### Ranh giới nghiêm ngặt

| Agent                   | ĐƯỢC làm                            | KHÔNG ĐƯỢC làm                |
| ----------------------- | ----------------------------------- | ----------------------------- |
| `frontend-specialist`   | Components, UI, styles, hooks       | ❌ Test files, API routes, DB |
| `backend-specialist`    | API, server logic, DB queries       | ❌ UI components, styles      |
| `test-engineer`         | Test files, mocks, coverage         | ❌ Production code            |
| `mobile-developer`      | RN/Flutter components, mobile UX    | ❌ Web components             |
| `database-architect`    | Schema, migrations, queries         | ❌ UI, API logic              |
| `security-auditor`      | Audit, vulnerabilities, auth review | ❌ Feature code, UI           |
| `devops-engineer`       | CI/CD, deployment, infra config     | ❌ Application code           |
| `performance-optimizer` | Profiling, optimization, caching    | ❌ New features               |
| `documentation-writer`  | Docs, README, comments              | ❌ Code logic                 |
| `debugger`              | Bug fixes, root cause               | ❌ New features               |
| `explorer-agent`        | Codebase discovery                  | ❌ Write operations           |

### File Type Ownership

| File Pattern                    | Owner Agent           | Các agent khác BLOCKED |
| ------------------------------- | --------------------- | ---------------------- |
| `**/*.test.{ts,tsx,js}`         | `test-engineer`       | ❌ Tất cả              |
| `**/__tests__/**`               | `test-engineer`       | ❌ Tất cả              |
| `**/components/**`              | `frontend-specialist` | ❌ backend, test       |
| `**/api/**`, `**/server/**`     | `backend-specialist`  | ❌ frontend            |
| `**/prisma/**`, `**/drizzle/**` | `database-architect`  | ❌ frontend            |

### Enforcement Protocol

```
KHI subagent chuẩn bị ghi file:
  NẾU file.path THUỘC domain của agent KHÁC:
    → DỪNG
    → GỌI đúng agent cho file đó
    → KHÔNG tự ghi
```

---

## 🔴 Pre-flight Checkpoints (Trước khi spawn)

> Áp dụng cho mọi orchestration — song song hoặc tuần tự.

| Checkpoint                  | Kiểm tra                                        | Nếu FAIL                       |
| --------------------------- | ----------------------------------------------- | ------------------------------ |
| **Plan tồn tại?**           | Đọc `docs/plans/*.md` hoặc `.planning/STATE.md` | DỪNG → Tạo plan trước          |
| **Loại dự án đã xác định?** | WEB / MOBILE / BACKEND                          | DỪNG → Hỏi user                |
| **Agent routing đúng?**     | Mobile → chỉ mobile-developer                   | Gán lại agent                  |
| **Tasks đã phân chia?**     | Có task breakdown rõ ràng                       | DỪNG → Dùng plan-writing skill |

> 🔴 **VI PHẠM:** Spawn subagents khi chưa có plan = Orchestration THẤT BẠI.

---

_Skill phiên bản 3.1 — Merged với orchestrator agent. Single source of truth cho multi-agent._
