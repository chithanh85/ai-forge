# AWF Enterprise Template v4.1

> 🇬🇧 [English README](README.en.md)

AWF là **template workflow phát triển phần mềm bằng AI trung lập với client**. Nó cung cấp cho repository một policy vận hành chuẩn duy nhất, cấu hình cục bộ theo từng project, workflow contract, verification gate và các adapter mỏng cho những môi trường AI coding tương thích với Codex, Gemini/Antigravity và Claude.

AWF **không phải** model router, không hứa hẹn việc giao phần mềm hoàn toàn không cần giám sát, và không thay thế cơ chế an toàn native của client mà bạn đang sử dụng.

## Vì sao có v4.1

Các phiên bản trước dần tích lũy nhiều giả định gắn với máy của người tạo template: command package manager bị hard-code trong rule, tên provider/model xuất hiện trong workflow, cú pháp riêng của từng client bị đưa vào shared policy, và runtime state của maintainer có thể bị mang sang project mới.

v4.1 thay đổi mô hình phân phối theo hướng **canonical core + native adapters**:

```text
                         AWF CORE
                policy / contracts / state
                          |
                    .awf/manifest.json
                          |
                     init / sync
                          |
        ---------------------------------------
        |                  |                  |
     AGENTS.md          GEMINI.md          CLAUDE.md
   compatible clients   Gemini-family      Claude-family
        |                  |                  |
        ---------------- capabilities --------
                          |
                  project toolchain
               npm / pnpm / yarn / bun
```

Repository được tổ chức quanh 6 nguyên tắc:

1. **Một canonical policy** — `.awf/policy/core.md` là policy trung lập với client.
2. **Cấu hình cục bộ theo project** — `.awf/manifest.json` lưu project identity, logical commands, clients và trạng thái integrations.
3. **Native adapters thay vì nhân bản policy** — `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` chứa vùng do AWF quản lý nhưng vẫn giữ nguyên nội dung do project tự viết ở bên ngoài vùng đó.
4. **Tự nhận diện toolchain** — project đích giữ package manager được phát hiện từ chính repository, thay vì kế thừa lựa chọn của tác giả template.
5. **Trung lập provider** — AWF mô tả role/capability; client/router/user đang hoạt động quyết định model cụ thể.
6. **Có bằng chứng trước khi tuyên bố hoàn tất** — test, artifacts, review decisions và trạng thái Git phải được kiểm tra trước khi task được coi là done.

## Cấu trúc repository

```text
.awf/
  manifest.json             Cấu hình AWF canonical theo project
  policy/core.md            Policy vận hành canonical, client-neutral
.agent/
  agents/                   Định nghĩa các specialist role
  workflows/                Workflow contracts (/plan, /code, /debug, ...)
  skills/                   Các domain skill có thể tái sử dụng
  schemas/artifacts/        Schema cho evidence artifacts
  scripts/                  Checklist, session, worktree và wiki tooling
  artifacts/                Runtime evidence của project hiện tại
.planning/                  Project identity và project state hiện tại
docs/                       Tài liệu hiện hành + historical records
scripts/awf/                Engine init/sync/doctor/config/exec cục bộ
AGENTS.md                    AGENTS-compatible adapter
GEMINI.md                    Gemini/Antigravity adapter
CLAUDE.md                    Claude-compatible adapter
```

Xem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) để hiểu chi tiết source-of-truth boundaries và lifecycle.

## Bắt đầu nhanh

v4.1 là một **framework nằm trong repository**, chưa phải một global CLI `awf` được publish độc lập.

Yêu cầu: Node.js 18+, Python 3.10+, Git và package manager mà repository đích yêu cầu.

### Windows PowerShell

```powershell
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
.\setup-enterprise.ps1 -ProjectName my-project
```

### Linux / macOS / WSL

```bash
git clone https://github.com/chithanh85/ai-forge.git my-project
cd my-project
bash ./setup-enterprise.sh --project-name my-project
```

Cả hai launcher đều tự neo execution vào thư mục project của chính nó, hydrate AWF state, cài dependency nếu không bị skip, chạy core verification và khởi tạo Git khi được yêu cầu.

Để xem đầy đủ flags và cách áp dụng AWF vào repository đã tồn tại, đọc [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

## Quá trình initialization thay đổi gì

`node scripts/awf/init.mjs --project-name <name>` thực hiện project hydration trong phạm vi kiểm soát:

- sanitize và ghi nhận project identity;
- phát hiện `pnpm-lock.yaml`, `yarn.lock`, `bun.lock*` hoặc `package-lock.json`;
- ghi logical command cho install/test/lint/typecheck/build/format vào `.awf/manifest.json`;
- reset template session state thành trạng thái sạch cho project mới;
- hydrate các identity placeholder thuộc template;
- đồng bộ vùng AWF-managed trong ba client adapter;
- giữ nguyên nội dung ngoài managed regions.

Việc chạy lại init/sync nhiều lần được thiết kế để **idempotent đối với phần do AWF quản lý**.

## Các lệnh cốt lõi

```bash
node scripts/awf/init.mjs --project-name my-project --root .
node scripts/awf/sync.mjs --root .
node scripts/awf/doctor.mjs --root .
node scripts/awf/configure.mjs --root . --integration gitnexus=true
node scripts/awf/exec.mjs test --root .
```

Agent nên ưu tiên logical commands trong `.awf/manifest.json`, thay vì hard-code `npm`, `pnpm`, `yarn` hoặc `bun`.

## Mô hình workflow

Workflow của AWF là **contract**, không phải lời đảm bảo rằng mọi AI client đều thực thi được mọi bước theo cùng một cách.

```text
request
  -> intake + risk lane
  -> plan khi cần
  -> design khi mức rủi ro yêu cầu
  -> implementation
  -> verification
  -> review / adversarial validation
  -> audit cho high-risk hoặc deploy work
```

Risk lane được định nghĩa trong [docs/FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md):

- **Tiny** — thay đổi nhỏ, blast radius thấp; cho phép planning gọn.
- **Normal** — cần plan rõ ràng và verification tiêu chuẩn.
- **High-Risk** — cần plan + design + explicit risk approval + verification/audit mạnh hơn.

Client đang hoạt động có thể chạy song song các subtasks độc lập nếu nó hỗ trợ safe parallel agents. Chạy tuần tự vẫn là đường thực thi đúng về mặt correctness.

## Evidence và artifact gate

Với các run `/plan`, `/code`, `/debug` không tầm thường, AWF kỳ vọng `.agent/artifacts/<run-id>/` có đủ:

```text
context-snippets.json
risk-gate.json
verification.json
review-decision.json
adversarial-validation.json
```

Checklist bình thường sẽ fail closed nếu evidence bắt buộc bị thiếu hoặc có blocking decision. Bootstrap dùng `--core` vì project mới chưa có task artifact thực tế.

```bash
python .agent/scripts/checklist.py . --core   # verify framework/bootstrap
python .agent/scripts/checklist.py .          # verify project/task bình thường
```

## Client adapters và quyền sở hữu model

AWF không chọn model vendor thay cho bạn. Managed adapters chỉ yêu cầu client đọc core policy, resolve command từ manifest, dùng optional capability khi thực sự khả dụng, và để việc chọn provider/model thuộc về client/router/user.

Tên model cụ thể, reasoning level, account configuration, sandbox policy và approval policy đều thuộc cấu hình của client/router/user đang được sử dụng.

## Optional integrations

AWF Core phải vẫn dùng được khi toàn bộ optional integrations đều vắng mặt.

| Integration     | Trạng thái trong v4.1                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| GitNexus        | Có transport definition đã pin version; setup/indexing là opt-in và capability vẫn là optional. |
| Second Brain    | Remote memory tùy chọn; có thể dùng local auto-memory fallback khi tồn tại.                     |
| Codebase Memory | Có thể ghi nhận capability, nhưng AWF không chạy remote installer chưa được pin/review.         |
| Rune            | Utility opt-in riêng và được pin version.                                                       |
| Open Design     | External capability tùy chọn; AWF Core không chạy installer npm hỏng hoặc unpinned.             |
| Clawpatch       | Local review workflow/state tùy chọn; không phải dependency bắt buộc của AWF Core.              |
| Teleport        | Reporting bridge tùy chọn; cấu hình theo từng project.                                          |

Xem [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) để hiểu trust boundaries.

## Verification của source repository này

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run wiki:lint
npm audit --audit-level=high
node scripts/awf/doctor.mjs --root .
```

Script `build` hiện tại cố ý chỉ là placeholder vì repository này là framework/template chứ không phải application. AWF Doctor báo nó là **NOT_CONFIGURED/WARN**; một placeholder build không bao giờ được coi là evidence rằng application đã build thành công.

## Security defaults

- Shared workflows không tắt sandbox/approval/trust protection native của client.
- File `.env` thật và credential thật được ignore và không được commit.
- Executable integration packages nên được pin version.
- Non-interactive setup không âm thầm bật optional integrations.
- High-risk work đi qua review/approval path mạnh hơn.
- Output của external AI luôn được coi là untrusted cho đến khi được kiểm chứng bằng repository evidence.

Đọc [SECURITY.md](SECURITY.md) trước khi cho automation tiếp cận production credentials hoặc remote execution.

## Tài liệu

Bắt đầu từ [docs/README.md](docs/README.md):

- [Architecture](docs/ARCHITECTURE.md)
- [Getting started](docs/GETTING_STARTED.md)
- [Operations](docs/OPERATIONS.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Feature intake](docs/FEATURE_INTAKE.md)
- [Test matrix](docs/TEST_MATRIX.md)
- [Knowledge index](docs/wiki-index.md)

`docs/plans/completed/` và các wiki lesson có ngày tháng là **historical evidence**, không phải AWF contract hiện hành.

## Những điều v4.1 cố ý không tuyên bố

- Không đảm bảo end-to-end delivery hoàn toàn không cần giám sát.
- Không đảm bảo multi-agent parallelism trên client không hỗ trợ tính năng đó.
- Không route hoặc tự chọn model thay cho user.
- Không biến optional MCP thành hard dependency.
- Không coi placeholder build command là bằng chứng application build thành công.
- Không cam kết việc áp dụng vào mọi existing repository sẽ hoàn toàn không có conflict; luôn review diff sau init/sync.

Các giới hạn này là chủ đích: AWF nên tăng kỷ luật và khả năng kiểm chứng của AI agent mà không giả vờ sở hữu các capability thực tế thuộc về active client hoặc target project.
