# Security Patterns — Project Implementation Guide

> **Security is not a feature. It's a property of every feature.**
> Cross-reference: `@[skills/vulnerability-scanner]`, `@[skills/red-team-tactics]`

## 🔴 Before Implementing Auth in Your Project

```
1. Check existing auth: grep for 'jwt', 'session', 'passport', 'auth'
2. Check .env files: what auth-related keys exist?
3. Check middleware: is there auth middleware already?
4. Decide: are you building auth or using a provider?
```

---

## Auth Decision — For Your Project

| Your situation                  | Approach          | Provider                     |
| ------------------------------- | ----------------- | ---------------------------- |
| MVP, time-constrained           | **Auth Provider** | Supabase Auth, Clerk, Auth0  |
| Enterprise, full control needed | **Self-hosted**   | Keycloak + custom            |
| Internal tools only             | **SSO**           | Google Workspace OIDC        |
| API-only, machine clients       | **API Keys**      | Self-managed with rate limit |

> **Default:** Use Supabase Auth or Clerk. Don't build your own unless you must.

---

## OAuth 2.0 Grant Type — Match to Your Client

| Your client                         | Grant Type             | Why                               |
| ----------------------------------- | ---------------------- | --------------------------------- |
| Web app with backend                | **Authorization Code** | Most secure, server holds secrets |
| SPA / Mobile app                    | **PKCE**               | No client secret exposed          |
| Backend service calling another API | **Client Credentials** | Machine-to-machine, no user       |
| Long-lived mobile session           | **Refresh Token**      | Auto-renew without re-login       |

---

## JWT Implementation Checklist

If your project uses JWTs:

- [ ] Short-lived access token (15 min max)
- [ ] Refresh token in httpOnly cookie (not localStorage!)
- [ ] Token rotation on refresh
- [ ] Revocation list for compromised tokens
- [ ] `iss`, `aud`, `exp` claims verified on every request
- [ ] RS256 (asymmetric) preferred over HS256 (symmetric)

---

## HTTPS/TLS Checklist

- [ ] TLS 1.3 minimum (TLS 1.2 if legacy clients)
- [ ] HSTS header with `includeSubDomains`
- [ ] Auto-renew certificates (Let's Encrypt / Cloudflare)
- [ ] No mixed content (all resources over HTTPS)

For service-to-service (internal):

- [ ] mTLS if zero-trust architecture
- [ ] Or: internal network with service mesh (Istio)

---

## Security Headers — Add to Your Project

```typescript
// Helmet.js for Express/NestJS handles most of these:
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

---

## Pre-Deploy Security Gate

**Run before every deployment:**

```bash
# Check for secrets in code
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# Check dependencies
npm audit --production
# or
pip install safety && safety check
```

---

## Secrets Management — For Your Project

| Secret Type            | Store In                  | Never In                    |
| ---------------------- | ------------------------- | --------------------------- |
| API keys, DB passwords | `.env.local` (gitignored) | Source code, git history    |
| Production secrets     | Server env vars / Vault   | `.env.production` committed |
| SSH keys               | `~/.ssh/` (chmod 600)     | Repo, docker image          |
| Auth tokens            | httpOnly cookies          | localStorage, URL params    |

**Check your `.gitignore` includes:**

```
.env
.env.local
.env.production
credentials/
*.key
*.pem
```

---

## Red Team Self-Check

Before marking any feature as done:

> "If I were a hacker, how would I attack this?"

- [ ] SQL injection: all queries parameterized?
- [ ] XSS: all user input sanitized/escaped?
- [ ] CSRF: token or SameSite cookie?
- [ ] Broken auth: can I access other users' data?
- [ ] Rate limiting: can I brute-force this endpoint?
- [ ] File upload: type/size validated server-side?
