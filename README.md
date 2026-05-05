# toey-sawatdee — Cloud Infrastructure & Observability Dashboard

> A production-grade, serverless portfolio engineered as a **real-time system status dashboard** — not a landing page.  
> Built on AWS (S3, CloudFront, Lambda, DynamoDB, Cognito), Next.js 16, and a custom **Blueprint design system**.

### [Live Demo → toey-sawatdee.me](https://toey-sawatdee.me)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                             │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ HTTPS
                           ▼
                ┌─────────────────────┐
                │   AWS CloudFront    │  ← CDN Edge (BKK / ap-southeast-2)
                │   + CF Functions    │  ← URL Rewrite for SPA routing
                └─────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
    ┌──────────────────┐    ┌──────────────────────┐
    │   AWS S3 Bucket  │    │   AWS API Gateway    │
    │  (Static Build)  │    │    (REST API)        │
    │  next build → out│    └─────────┬────────────┘
    └──────────────────┘              │
                                      ▼
                          ┌────────────────────────┐
                          │   AWS Lambda (Python)   │
                          │  • Visitor Counter API  │
                          │  • Zomboid Telemetry    │
                          └─────────┬──────────────┘
                                    │
                                    ▼
                          ┌────────────────────────┐
                          │   AWS DynamoDB         │
                          │   (On-Demand Capacity) │
                          └────────────────────────┘

    ┌──────────────────────────────────────────────┐
    │         Dedicated Game Server (Linux)         │
    │  ┌────────────────────────────────────┐       │
    │  │  Guardian Agent (Node.js)          │       │
    │  │  • Polls game server every 60s     │       │
    │  │  • Pushes telemetry to Lambda      │       │
    │  │  • SIGINT/SIGTERM → final OFFLINE  │       │
    │  └────────────────────────────────────┘       │
    └──────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────┐
    │         GitHub Actions (CI/CD)                │
    │  • OIDC → STS AssumeRole (no static keys)    │
    │  • npm build → S3 sync → CF invalidation     │
    └──────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────┐
    │         AWS Cognito (Authentication)          │
    │  • SRP Auth (no password over the wire)       │
    │  • JWT session management                     │
    │  • Admin-only route protection                │
    └──────────────────────────────────────────────┘
```

---

## Architectural Trade-offs & Security Decisions

### OIDC Federation over Static AWS Keys

The CI/CD pipeline authenticates to AWS via **GitHub OIDC → STS AssumeRole**, issuing short-lived tokens per deployment run. No `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are stored as long-lived secrets for deployment. This eliminates the risk of credential leakage from repository forks or compromised Actions runners.

> _Build-time env vars (e.g. `NEXT_PUBLIC_API_URL`) are still injected via GitHub Secrets but are baked into static HTML at build time — they contain no privileged credentials._

### Serverless Routing: GET vs POST Isolation

The visitor counter Lambda **increments on every HTTP method** by default (a common serverless anti-pattern). To prevent F5-spam inflation:

- The frontend POSTs **once per browser session** to increment the counter
- The result is cached in `sessionStorage` — subsequent page navigations read from cache with **zero API calls**
- The Status Page pings AWS health via the **Cognito OIDC `.well-known` endpoint** (idempotent, free, zero side effects) instead of hitting Lambda

This keeps DynamoDB read/write costs under **$1/month** even under continuous polling.

### Data Sanitization & Backend Boundaries

- The Zomboid Lambda returns only a curated `{ success, data }` payload — internal AWS metadata (`RequestId`, `FunctionArn`, execution context) is stripped before response
- The Guardian Agent on the game server pushes **pre-aggregated** metrics (peak players, avg ping, uptime) — raw server logs and filesystem paths never leave the host
- The `DecimalEncoder` in Python Lambda prevents DynamoDB's `Decimal` type from crashing JSON serialization — a silent data corruption bug that only surfaces under load

### CloudFront Functions over Lambda@Edge

URL path rewriting for Next.js static export uses **CloudFront Functions** (sub-millisecond, $0.10/million) instead of Lambda@Edge ($0.60/million + cold start). The trade-off: no network/filesystem access in the rewrite logic — acceptable since we only need path manipulation.

---

## Local Development Setup

### Prerequisites

- Node.js **20+**
- npm **10+**

### Installation

```bash
git clone https://github.com/ttser123/toey-sawatdee.git
cd toey-sawatdee
npm ci
```

> **Use `npm ci`**, not `npm install`. This installs from the lockfile exactly, ensuring deterministic builds across machines.

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-cognito-client-id
NEXT_PUBLIC_ZOMBOID_API_URL=https://your-lambda-function-url.on.aws/
AWS_REGION=ap-southeast-2
```

> All `NEXT_PUBLIC_*` variables are embedded into the static build at compile time. They contain **no privileged credentials** — only public-facing API endpoints and Cognito pool identifiers.

### Run

```bash
npm run dev       # → http://localhost:3000
npm run build     # Production static export → out/
```

### Security Policy

The following are **excluded from version control** via `.gitignore`:

| Pattern | Purpose |
|---------|---------|
| `.env*` | All environment variable files — API URLs, Cognito IDs, AWS config |
| `*.pem` | SSL/TLS certificates and private keys |
| `.agents/` | Local AI agent configuration and rules |
| `.next/`, `out/` | Build artifacts (reproducible from source) |

**No credentials, tokens, or secrets should ever be committed.** AWS deployment authentication uses OIDC federation — no static keys exist in the repository.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (Static Export), React 19, TypeScript 5, Tailwind CSS 4 |
| **Design System** | Custom "Blueprint" aesthetic — graph-paper grid, tracing-paper cards, monospace metrics |
| **Auth** | AWS Cognito (SRP + JWT) |
| **API** | AWS API Gateway → Lambda (Python 3.12) |
| **Database** | AWS DynamoDB (On-Demand) |
| **CDN** | AWS CloudFront + CloudFront Functions |
| **DNS/TLS** | AWS Route 53 + ACM |
| **CI/CD** | GitHub Actions → OIDC → S3 Sync → CF Invalidation |
| **Game Telemetry** | Node.js Guardian Agent on dedicated Linux server |
