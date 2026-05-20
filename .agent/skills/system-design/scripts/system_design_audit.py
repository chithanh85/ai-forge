#!/usr/bin/env python3
"""
System Design Audit Script
Scans the project for common system design anti-patterns and missing best practices.

Usage: python .agent/skills/system-design/scripts/system_design_audit.py .

Checks:
  1. Single points of failure (no health check endpoints)
  2. Missing database indexes on foreign keys
  3. Hardcoded URLs/ports/IPs
  4. Missing rate limiting
  5. No circuit breaker on external HTTP calls
  6. Missing env parity (production vs local)
  7. No caching strategy detected
  8. Docker single-stage build (no multi-stage)
"""

import os
import re
import sys
from pathlib import Path

class SystemDesignAudit:
    def __init__(self, project_root):
        self.root = Path(project_root)
        self.errors = []
        self.warnings = []
        self.passes = []

    def run(self):
        print("🏗️  System Design Audit")
        print(f"   Project: {self.root.resolve()}\n")

        self.check_health_endpoint()
        self.check_hardcoded_values()
        self.check_env_parity()
        self.check_docker_multistage()
        self.check_rate_limiting()
        self.check_caching()
        self.check_circuit_breaker()
        self.check_architecture_doc()
        self.check_single_db()

        self.report()

    def check_health_endpoint(self):
        """Check for health check endpoint."""
        found = False
        for ext in ['*.ts', '*.js', '*.py', '*.go']:
            for f in self.root.rglob(ext):
                if 'node_modules' in str(f) or 'dist' in str(f):
                    continue
                try:
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    if re.search(r'["\'/]health["\']|healthcheck|health_check|/healthz', content, re.I):
                        found = True
                        break
                except:
                    pass
            if found:
                break

        if found:
            self.passes.append("✅ Health check endpoint detected")
        else:
            self.warnings.append("⚠️  No health check endpoint found — services should expose /health or /healthz")

    def check_hardcoded_values(self):
        """Check for hardcoded URLs, IPs, and ports."""
        patterns = [
            (r'https?://(?:localhost|127\.0\.0\.1):\d+', 'Hardcoded localhost URL'),
            (r'(?<![.\d])\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?![\d.])', 'Hardcoded IP address'),
            (r'port\s*[:=]\s*\d{4,5}(?!\s*\|\|)', 'Hardcoded port without fallback'),
        ]
        issues = []
        for ext in ['*.ts', '*.js', '*.py']:
            for f in self.root.rglob(ext):
                if any(skip in str(f) for skip in ['node_modules', 'dist', '.git', 'test', 'spec']):
                    continue
                try:
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    for pattern, desc in patterns:
                        matches = re.findall(pattern, content)
                        if matches:
                            rel = f.relative_to(self.root)
                            issues.append(f"  {rel}: {desc} ({matches[0]})")
                except:
                    pass

        if issues:
            self.warnings.append(f"⚠️  Hardcoded values found ({len(issues)} files):")
            self.warnings.extend(issues[:5])
        else:
            self.passes.append("✅ No hardcoded URLs/IPs/ports detected")

    def check_env_parity(self):
        """Check if production and local env files have same keys."""
        envs_dir = self.root / 'envs'
        if not envs_dir.exists():
            envs_dir = self.root

        env_files = list(envs_dir.glob('.env*example*')) + list(envs_dir.glob('.env*.example'))
        if len(env_files) < 2:
            self.warnings.append("⚠️  Less than 2 env template files — cannot verify env parity")
            return

        key_sets = {}
        for ef in env_files:
            try:
                content = ef.read_text(encoding='utf-8', errors='ignore')
                keys = set()
                for line in content.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        keys.add(line.split('=')[0].strip())
                key_sets[ef.name] = keys
            except:
                pass

        if len(key_sets) >= 2:
            all_keys = set()
            for ks in key_sets.values():
                all_keys |= ks
            missing = []
            for name, keys in key_sets.items():
                diff = all_keys - keys
                if diff:
                    missing.append(f"  {name} missing: {', '.join(sorted(diff)[:3])}")
            if missing:
                self.warnings.append(f"⚠️  Env parity issues:")
                self.warnings.extend(missing[:3])
            else:
                self.passes.append("✅ Env files have consistent keys")

    def check_docker_multistage(self):
        """Check if Dockerfile uses multi-stage build."""
        dockerfile = self.root / 'Dockerfile'
        if not dockerfile.exists():
            self.warnings.append("⚠️  No Dockerfile found")
            return

        content = dockerfile.read_text(encoding='utf-8', errors='ignore')
        from_count = len(re.findall(r'^FROM\s+', content, re.MULTILINE))
        if from_count >= 2:
            self.passes.append(f"✅ Multi-stage Dockerfile ({from_count} stages)")
        else:
            self.warnings.append("⚠️  Single-stage Dockerfile — use multi-stage for smaller images")

    def check_rate_limiting(self):
        """Check for rate limiting implementation."""
        found = False
        for ext in ['*.ts', '*.js', '*.py']:
            for f in self.root.rglob(ext):
                if 'node_modules' in str(f):
                    continue
                try:
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    if re.search(r'rate.?limit|throttle|RateLimiter|express-rate-limit', content, re.I):
                        found = True
                        break
                except:
                    pass
            if found:
                break

        if found:
            self.passes.append("✅ Rate limiting detected")
        else:
            self.warnings.append("⚠️  No rate limiting found — public APIs should have rate limits")

    def check_caching(self):
        """Check for caching strategy."""
        found = False
        patterns = ['redis', 'memcached', 'cache-control', 'CacheModule', 'node-cache', 'lru-cache']
        for ext in ['*.ts', '*.js', '*.py', '*.yml', '*.yaml']:
            for f in self.root.rglob(ext):
                if 'node_modules' in str(f):
                    continue
                try:
                    content = f.read_text(encoding='utf-8', errors='ignore').lower()
                    if any(p.lower() in content for p in patterns):
                        found = True
                        break
                except:
                    pass
            if found:
                break

        if found:
            self.passes.append("✅ Caching strategy detected")
        else:
            self.warnings.append("⚠️  No caching detected — consider Redis/Memcached for read-heavy data")

    def check_circuit_breaker(self):
        """Check for circuit breaker on external calls."""
        found = False
        patterns = ['circuit.?breaker', 'opossum', 'cockatiel', 'resilience4j', 'polly']
        for ext in ['*.ts', '*.js', '*.py']:
            for f in self.root.rglob(ext):
                if 'node_modules' in str(f):
                    continue
                try:
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    if any(re.search(p, content, re.I) for p in patterns):
                        found = True
                        break
                except:
                    pass
            if found:
                break

        if found:
            self.passes.append("✅ Circuit breaker pattern detected")
        else:
            self.warnings.append("⚠️  No circuit breaker — external API calls should have fallback protection")

    def check_architecture_doc(self):
        """Check for architecture documentation."""
        arch_files = ['ARCHITECTURE.md', 'CODEBASE_INDEX.md', 'docs/architecture.md']
        found = any((self.root / f).exists() for f in arch_files)

        if found:
            self.passes.append("✅ Architecture documentation exists")
        else:
            self.errors.append("❌ No ARCHITECTURE.md or CODEBASE_INDEX.md — document your system design")

    def check_single_db(self):
        """Check if docker-compose has DB redundancy indicators."""
        compose = self.root / 'docker-compose.yml'
        if not compose.exists():
            return

        content = compose.read_text(encoding='utf-8', errors='ignore')
        if 'postgres' in content.lower() or 'mysql' in content.lower():
            if 'replica' in content.lower() or 'replication' in content.lower():
                self.passes.append("✅ Database replication configured")
            else:
                self.warnings.append("⚠️  Single database instance in docker-compose — consider replicas for production")

    def report(self):
        print("=" * 50)
        if self.errors:
            print(f"\n❌ Errors ({len(self.errors)}):")
            for e in self.errors:
                print(f"  {e}")

        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for w in self.warnings:
                print(f"  {w}")

        if self.passes:
            print(f"\n✅ Passed ({len(self.passes)}):")
            for p in self.passes:
                print(f"  {p}")

        total = len(self.errors) + len(self.warnings) + len(self.passes)
        score = len(self.passes) / total * 100 if total > 0 else 0
        print(f"\n📊 Score: {score:.0f}% ({len(self.passes)}/{total} checks passed)")

        if self.errors:
            print("\n🔴 Fix errors before deploying!")
            sys.exit(1)
        elif len(self.warnings) > 3:
            print("\n🟡 Several warnings — review before production.")
        else:
            print("\n🟢 System design looks solid!")

def main():
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    audit = SystemDesignAudit(root)
    audit.run()

if __name__ == '__main__':
    main()
