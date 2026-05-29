---
name: ba-pipeline
description: "🚀 Full-Auto BA Pipeline: Brainstorm → Use Case → User Story → Plan (one command)"
---

# /ba-pipeline — Full-Auto BA Pipeline

> **Một lệnh duy nhất**: AI hỏi kỹ → Tự viết Use Case → Tự tách User Story → Tự lên Plan.
> User chỉ cần trả lời câu hỏi ban đầu, sau đó ngồi xem AI chạy hết.

## Trigger

User types `/ba-pipeline` or `/ba` (shortcut)

---

## Overview

```
PHASE 1: Brainstorm (HỎI KỸ — dừng chờ user trả lời)
    ↓ output → .planning/REQUIREMENTS.md
PHASE 2: Use Case (TỰ ĐỘNG — skip confirmation gates)
    ↓ output → docs/use-cases/UC-*.md
PHASE 3: User Story + AC (TỰ ĐỘNG — full generation)
    ↓ output → docs/user-stories/US-*.md
PHASE 4: Implementation Plan (TỰ ĐỘNG)
    ↓ output → docs/plans/active/{feature-slug}/index.md + phase files
PHASE 5: Summary + Review Gate (DỪNG — user xem lại toàn bộ)
```

---

## Phase 1: Brainstorm — Thu thập yêu cầu (INTERACTIVE)

### 1.1 Context + Recall

1. Read `.planning/STATE.md`
2. Read `.planning/REQUIREMENTS.md`
3. **AUTO-RECALL:**
   ```bash
   python .agent/skills/auto-memory/scripts/local_brain.py recall "{topic}"
   ```

### 1.2 Socratic Questions (Bắt buộc hỏi, chờ user trả lời)

Ask minimum 5 questions covering:

1. **Problem**: Bài toán cụ thể là gì?
2. **Users/Actors**: Ai sẽ dùng? Liệt kê tất cả role/persona.
3. **Core Flow**: Luồng chính user sẽ đi qua?
4. **Edge Cases**: Những trường hợp ngoại lệ quan trọng?
5. **System Boundary**: Hệ thống nào liên quan? (Payment gateway? LMS? Calendar?)

> 🔴 **HARD STOP**: Phải có đủ trả lời trước khi tiếp tục.

### 1.3 Confirm understanding

```markdown
## 📋 Tóm tắt yêu cầu

- **Bài toán**: {X}
- **Actors**: {list actors with roles}
- **Core goals**: {list goals}
- **System boundary**: {system name}
- **Out of scope**: {explicitly state}

**Đúng chưa? Confirm để em chạy Full-Auto từ đây.**
```

> 🔴 **HARD STOP**: Chờ user confirm. Sau khi confirm, TOÀN BỘ Phase 2-4 chạy tự động.

### 1.4 Save requirements

- Update `.planning/REQUIREMENTS.md` with confirmed requirements

---

## Phase 2: Use Case Generation (AUTO — no confirmation gates)

> ⚡ **MODE: Full-Auto** — Skip tất cả "confirm to proceed" gates trong use-case-writer skill.

### 2.1 Load Skill

- Read skill: `@[skills/use-case-writer]`
- **Override**: Set Mode A (write new from feature), **skip sequential confirmations**

### 2.2 Scope all Use Cases

Apply the 3 identification techniques from the skill:

1. **Goal-driven**: List all goals per actor → each = 1 UC candidate
2. **Event-driven**: External + internal triggers
3. **CRUD-driven**: For each entity, check C/R/U/D

Output: UC List table

```markdown
| UC ID | UC Name (verb + noun) | Primary Actor | Goal | Priority |
| ----- | --------------------- | ------------- | ---- | -------- |
| UC-01 | ...                   | ...           | ...  | High     |
```

### 2.3 Generate all UCs — ⚡ PARALLEL nếu >= 2 UCs

> Invoke `@[agents/orchestrator]` — Pattern 5 (BA Parallel) từ parallel-agents skill

**Nếu chỉ có 1 UC**: Viết tuần tự bình thường.

**Nếu có >= 2 UCs**: Spawn N subagents song song, mỗi agent viết 1 UC:

```
┌── Subagent 1: Viết UC-01 (full 13-field, 20-point check) ──┐
├── Subagent 2: Viết UC-02 (full 13-field, 20-point check) ──┼──→ Merge
└── Subagent 3: Viết UC-03 (full 13-field, 20-point check) ──┘
```

Mỗi subagent nhận:

- UC ID, Name, Actor, Goal từ UC List (bước 2.2)
- Requirements context từ `.planning/REQUIREMENTS.md`
- Hướng dẫn: viết full 5 section groups, chạy 20-point checklist nội bộ
- Phạm vi output: chỉ 1 file `docs/use-cases/{UC-ID}_{name}.md`

> ⚠️ **Giới hạn**: Tối đa 4 subagents song song. Nếu > 4 UCs, chia thành 2 batch.

### 2.4 Save outputs

- Create `docs/use-cases/` directory if not exists
- Save each UC as `docs/use-cases/{UC-ID}_{uc-name-kebab}.md`
- Kiểm tra cross-reference giữa các UC (Includes field phải trỏ đúng)
- Print: `"✅ Phase 2 done: Generated {N} Use Cases (parallel). Proceeding to User Stories..."`

---

## Phase 3: User Story + Acceptance Criteria (AUTO)

> ⚡ **MODE: Full-Auto** — Skip confirmation gates in user-story-ac-writer skill.

### 3.1 Load Skill

- Read skill: `@[skills/ba-zone-user-story-ac-writer]`
- **Override**: Set Mode A (write new), auto-apply INVEST check

### 3.2 Transform UCs → User Stories — ⚡ PARALLEL nếu >= 2 UCs

> Invoke `@[agents/orchestrator]` — Pattern 1 (Fan-Out / Fan-In) từ parallel-agents skill

**Nếu chỉ có 1 UC**: Chuyển đổi tuần tự.

**Nếu có >= 2 UCs**: Spawn N subagents song song, mỗi agent xử lý 1 UC:

```
┌── Subagent 1: UC-01 → User Stories + ACs ──┐
├── Subagent 2: UC-02 → User Stories + ACs ──┼──→ Merge All
└── Subagent 3: UC-03 → User Stories + ACs ──┘
```

Mỗi subagent thực hiện:

1. Extract actor (→ persona), goal (→ I want to), business value (→ so that)
2. Generate User Story theo format `As a / I want to / So that`
3. Apply INVEST self-check (sửa tự động nếu fail)
4. Generate tối thiểu 3 ACs per story (happy path, edge case, negative path)
5. Nếu story quá lớn (>7 AC hoặc covers CRUD), **auto-split**

> ⚠️ **Giới hạn**: Tối đa 4 subagents song song.

### 3.3 Save outputs

- Create `docs/user-stories/` directory if not exists
- Save as `docs/user-stories/{US-ID}_{story-name-kebab}.md`
- Đánh số US-ID liên tục xuyên suốt tất cả UCs (không trùng)
- Print: `"✅ Phase 3 done: Generated {N} User Stories with {M} total ACs (parallel). Proceeding to Plan..."`

---

## Phase 4: Implementation Plan (AUTO)

> ⚡ **MODE: Full-Auto** — Use plan-writing skill to create task breakdown.

### 4.1 Load Skill

- Read skill: `@[skills/plan-writing]`

### 4.2 Create Plan

1. Group User Stories by module/domain
2. Define implementation phases (logical order respecting dependencies)
3. For each phase, break down into tasks:
   - Files to create/modify
   - Dependencies
   - Estimate (S/M/L/XL)
   - Acceptance criteria (link to story's AC)
   - Test requirements
4. Identify risks and out-of-scope items
5. Run the rationalization-prevention check from `.agent/rules/rationalization-prevention.md` before finalizing the plan.

### 4.3 Save outputs

- Save as split folder:
  - `docs/plans/active/{feature-slug}/index.md`
  - `docs/plans/active/{feature-slug}/phase-XX-{phase-name}.md`
  - `docs/plans/active/{feature-slug}/current-phase.txt`
- Set `current-phase.txt` to the first implementation phase.
- Verify hydration:
  ```bash
  python .agent/scripts/plan_hydrate.py context {feature-slug}
  ```
- Update `.planning/STATE.md`
- Update `.planning/ROADMAP.md`
- Print: `"✅ Phase 4 done: Plan created with {N} phases, {M} tasks."`

---

## Phase 5: Summary + Review Gate (INTERACTIVE)

### 5.1 Print Full Summary

```markdown
## 🎯 BA Pipeline Complete!

### 📊 Statistics

| Artifact            | Count     | Location                            |
| ------------------- | --------- | ----------------------------------- |
| Use Cases           | {N}       | `docs/use-cases/`                   |
| User Stories        | {M}       | `docs/user-stories/`                |
| Acceptance Criteria | {K} total | (embedded in stories)               |
| Plan Tasks          | {T}       | `docs/plans/active/{slug}/index.md` |

### 📁 Files Generated

- `docs/use-cases/UC-*.md` — {list}
- `docs/user-stories/US-*.md` — {list}
- `docs/plans/active/{slug}/index.md`
- `docs/plans/active/{slug}/phase-XX-*.md`
- `.planning/REQUIREMENTS.md` (updated)
- `.planning/STATE.md` (updated)

### ⚠️ Items Needing Human Review

- {list any TBDs, assumptions, or flagged issues from UC/US generation}
```

### 5.2 AUTO-REMEMBER

```bash
python .agent/skills/auto-memory/scripts/local_brain.py remember \
  "BA Pipeline: {feature name}" \
  "Generated {N} UCs, {M} USs, {K} ACs, {T} tasks. Key decisions: {list}." \
  --tags ba-pipeline feature planning --type decision
```

### 5.3 Next Steps Menu

```markdown
**Tiếp theo bạn muốn làm gì?**

1. 📝 `/review` — Xem lại và chỉnh sửa các artifact
2. 🎨 `/design` — Thiết kế DB schema + API
3. 💻 `/code` — Bắt đầu code (TDD)
4. 🔄 Sửa lại — Nói chi tiết cần sửa gì, em chạy lại phase đó
```

---

## Error Handling

| Situation                           | Action                                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| User's brainstorm answers too vague | Hỏi lại câu hỏi cụ thể hơn, KHÔNG tiến sang Phase 2        |
| UC scope quá lớn (summary level)    | Auto-split theo goal-driven technique                      |
| User Story quá lớn (>7 AC)          | Auto-split theo CRUD/persona pattern                       |
| Plan task quá lớn (XL)              | Auto-split thành subtasks S/M                              |
| Bất kỳ lỗi nào ở Phase 2-4          | Log lỗi vào Notes/Issues, tiếp tục chạy, báo cáo ở Phase 5 |

---

## Shortcut Variants

| Command                            | Behavior                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `/ba-pipeline`                     | Full pipeline (Phase 1→5)                            |
| `/ba`                              | Alias for `/ba-pipeline`                             |
| `/ba-pipeline --from-requirements` | Skip Phase 1, đọc `.planning/REQUIREMENTS.md` có sẵn |
| `/ba-pipeline --uc-only`           | Chỉ chạy Phase 2 (Use Case)                          |
| `/ba-pipeline --us-only`           | Chỉ chạy Phase 3 (User Story)                        |
