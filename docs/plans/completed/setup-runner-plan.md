# Plan: Cài đặt GitHub Actions Self-Hosted Runner

**Status**: Draft
**Created**: 2026-05-20
**Estimated**: S (1-2h)
**Assigned to**: Codex Agent

## Context

Dự án cần một hệ thống CI/CD để tự động kiểm tra code (Lint, Test, Security Scan) và triển khai (Deploy). Để tiết kiệm chi phí và tăng tốc độ build, chúng ta sẽ cài đặt một Self-Hosted Runner trên máy chủ cá nhân/VPS của hệ thống, thay vì dùng runner mặc định của GitHub.

---

## Tasks

### Task 1: Chuẩn bị Script Cài đặt Runner (Trên Repo Local)

- **Files**: `scripts/deploy/install-github-runner.sh`
- **Mục tiêu**: Codex cần tạo một bash script chuẩn để cài đặt GitHub runner (tải file tar.gz, giải nén, config và chạy background).
- **Yêu cầu kỹ thuật**:
  - Tải đúng version runner mới nhất cho Linux x64.
  - Hỗ trợ tham số `--token` và `--url`.
  - Có lệnh cài đặt service bằng `svc.sh` (chạy ngầm tự khởi động lại khi server restart).
- **Acceptance Criteria**: Có file script `install-github-runner.sh` với code bash chuẩn.

### Task 2: Config GitHub Actions Workflows (Trên Repo Local)

- **Files**: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- **Mục tiêu**: Viết các file workflow sử dụng self-hosted runner.
- **Yêu cầu kỹ thuật**:
  - Tại file YAML, khai báo `runs-on: self-hosted`.
  - Pipeline CI chạy: `pnpm install`, `pnpm lint`, `pnpm test`.
  - Thiết lập caching cho `node_modules` hoặc tận dụng cache local của runner.
- **Acceptance Criteria**: Các file `.yml` có nhãn `self-hosted` hợp lệ.

### Task 3: Đăng ký Runner lên GitHub (Thao tác trên Browser/Web)

- **Mục tiêu**: Lấy token kết nối từ GitHub Repo.
- **Hướng dẫn cho User (Codex cần nhắc User)**:
  1. Vào Repo trên GitHub > **Settings** > **Actions** > **Runners**.
  2. Bấm **New self-hosted runner**.
  3. Chọn OS (Linux) và copy cái **Registration Token**.

### Task 4: Thực thi Cài đặt trên Server (Thao tác qua SSH)

- **Mục tiêu**: Chạy script cài đặt trên VPS.
- **Hướng dẫn Codex**:
  1. Nhắc user SSH vào server VPS.
  2. Copy script `install-github-runner.sh` lên VPS.
  3. Chạy lệnh: `bash install-github-runner.sh --url https://github.com/USERNAME/REPO --token THE_TOKEN`
- **Acceptance Criteria**: Trạng thái Runner trên GitHub web chuyển sang màu xanh (Idle / Online).

### Task 5: Xác thực Pipeline (Push Test)

- **Mục tiêu**: Chạy thử quy trình CI.
- **Hướng dẫn Codex**:
  1. Commit toàn bộ thay đổi ở Task 1 & 2.
  2. Push code lên nhánh `main`.
  3. Nhắc user theo dõi tab **Actions** trên GitHub để xem runner (trên VPS) nhận job và xử lý thành công.

---

## Out of Scope

- Config Docker hay Nginx để host web server (chỉ focus vào cài runner).
- Tự động SSH vào VPS bằng tool (User sẽ chủ động chạy lệnh trên VPS vì lý do bảo mật).

## Risks

- **Trùng lặp Runner**: Cài 2 lần trên cùng 1 máy sẽ gây xung đột. **Mitigation**: Script cài đặt phải kiểm tra xem runner đã tồn tại chưa.
- **Thiếu quyền sudo**: Cài `svc.sh` cần quyền sudo. **Mitigation**: Thêm kiểm tra quyền sudo vào đầu script.

## Verification

- [ ] Script `install-github-runner.sh` tồn tại và đúng chuẩn.
- [ ] Workflow YAML khai báo `runs-on: self-hosted`.
- [ ] Tab Actions trên web hiện Runner trạng thái xanh (Idle).
- [ ] Lần commit đầu tiên chạy thành công trên máy chủ (hiện check mark xanh ✅).
