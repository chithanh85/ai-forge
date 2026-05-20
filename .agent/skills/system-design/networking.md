# Networking — Reference (Read When Needed)

> This file is pure reference. Read only when making networking decisions.
> For project-level decisions, start from `SKILL.md`.

## IP Types Quick Reference

| Type    | Use                    | Example                          |
| ------- | ---------------------- | -------------------------------- |
| Public  | Server external access | VPS IP, domain DNS               |
| Private | Internal network       | 10.x.x.x, 192.168.x.x, Tailscale |
| Static  | Servers, DNS records   | Production server IP             |
| Dynamic | Client devices         | Home ISP                         |

**Project check:** What IPs are in your `.env.production`? Are they hardcoded or DNS-resolved?

## DNS — What Your Project Uses

Check your domain configuration:

- [ ] A/AAAA records point to your server/LB
- [ ] CNAME for subdomains (api.example.com → LB)
- [ ] MX records for email
- [ ] TXT for SPF/DKIM/DMARC (email auth)
- [ ] Low TTL during migrations, higher (3600) for stable

## TCP vs UDP — Already Decided for You

| Your project uses     | Protocol | Already handled by    |
| --------------------- | -------- | --------------------- |
| HTTP/HTTPS API        | TCP      | Your web framework    |
| WebSocket             | TCP      | Socket.io/ws          |
| Database connections  | TCP      | DB driver             |
| Video/voice streaming | UDP      | WebRTC, media servers |

> You rarely need to think about TCP vs UDP directly. Your framework handles it.

## OSI Model — When It Matters

| Layer                | When you care       | Example decision            |
| -------------------- | ------------------- | --------------------------- |
| L7 (Application)     | API design, auth    | REST vs gRPC                |
| L4 (Transport)       | Load balancer type  | L4 LB vs L7 LB              |
| L3 (Network)         | Firewall rules, VPN | Tailscale, security groups  |
| L1-2 (Physical/Link) | Almost never        | Cloud provider handles this |
