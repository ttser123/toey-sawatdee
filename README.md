# toey-sawatdee — Cloud Infrastructure & Observability Dashboard

[![Deployment Status](https://github.com/ttser123/toey-sawatdee/actions/workflows/deploy.yml/badge.svg)](https://github.com/ttser123/toey-sawatdee/actions/workflows/deploy.yml)

A production-grade portfolio engineered as a real-time system status dashboard — not a landing page.
Built on AWS (EC2, CloudFront, Lambda, DynamoDB, Cognito), Next.js 16, Docker, Terraform, and a custom Blueprint design system.

[Live Demo → toey-sawatdee.me](https://toey-sawatdee.me)

---

## System Architecture

The infrastructure is organized into five operational zones, all managed as Terraform IaC:

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                             │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ZONE 1 — THE EDGE  (Global Delivery)                              │
│                                                                     │
│  Route 53 ──► CloudFront CDN ──► ACM (SSL/TLS)                     │
│  • origin.* A-record → Elastic IP (DNS loop bypass)                │
│  • RSC header whitelist cache policy (prevents cache poisoning)      │
│  • TLS 1.2+ enforced, SNI-only, ACM cert from us-east-1            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌───────────────────────┐   ┌────────────────────────────────────────┐
│  ZONE 2 — COMPUTE     │   │  ZONE 3 — SERVERLESS BACKEND          │
│  CORE                 │   │  (Decoupled Microservices)             │
│  EC2 (t3.micro)       │   │                                        │
│                       │   │  Cognito ─ Identity mgmt (JWT/SRP)     │
│  SG: CloudFront-only  │   │  Lambda  ─ Async telemetry ingestion   │
│    prefix list (P80)  │   │  DynamoDB ─ On-demand NoSQL state      │
│  Docker (env isolation│   │                                        │
│    + standalone build)│   │                                        │
│  Next.js SSR          │   │                                        │
│    (dynamic routes +  │   │                                        │
│     middleware auth)   │   │                                        │
└───────────────────────┘   └────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ZONE 4 — CI/CD AUTOMATION  (Automated Deployment)                  │
│                                                                     │
│  Multi-stage Docker Build ─ Standalone output (~69MB image)         │
│  GitHub Actions ─ Automated pipelines → GHCR on every merge        │
│  SSM RunCommand ─ Zero-SSH deployment, GHCR token from Param Store  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ZONE 5 — INFRASTRUCTURE AS CODE  (Terraform)                       │
│                                                                     │
│  AWS Provider 6.x ─ VPC, Subnet, IGW, Route Table                   │
│  Launch Template ─ AL2023 AMI (auto-latest), IAM Instance Profile   │
│  Immutable Infra ─ Entire stack declared, versioned, reproducible   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DEDICATED GAME SERVER  (Linux)                                     │
│                                                                     │
│  Guardian Agent (Node.js)                                           │
│  • Polls game server every 60s                                      │
│  • Pushes telemetry to Lambda                                       │
│  • SIGINT/SIGTERM → final OFFLINE                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Trade-offs & Security Decisions

### Zero-SSH Deployment via SSM

The CI/CD pipeline deploys via AWS Systems Manager RunCommand — no SSH keys exist on the server, no port 22 is open. The EC2 instance authenticates to GHCR by pulling a PAT token from SSM Parameter Store (encrypted at rest). GitHub Actions triggers SSM send-command targeting the instance by tag name, eliminating all stored SSH credentials.

> Build-time env vars (e.g. NEXT_PUBLIC_API_URL) are still injected via GitHub Secrets but are embedded at build time — they contain no privileged credentials.

### EC2 + Docker over Serverless Static Export

The application runs as a Dockerized Next.js SSR instance on EC2 (t3.micro), rather than a static S3 export. This enables:

- Server-Side Rendering for dynamic routes and real-time data
- Middleware-level authentication checks before page render
- Full environment isolation via Docker containers, standardizing production and local states

The trade-off: a persistent compute instance (~$8/month) versus pay-per-request Lambda, but SSR capabilities and middleware auth justify the cost.

### CloudFront Prefix List Security Group

The EC2 security group allows HTTP (port 80) ingress **only** from the CloudFront managed prefix list (`com.amazonaws.global.cloudfront.origin-facing`). No SSH port, no direct IP access. This creates a locked perimeter where the only path to the application is through CloudFront.

### RSC Cache Poisoning Prevention

The CloudFront distribution uses a custom cache policy that whitelists `Accept`, `rsc`, `next-router-prefetch`, and `next-router-state-tree` headers as cache key parameters. Without this, CloudFront would serve the same cached response for both HTML page requests and RSC JSON payloads — silently breaking client-side navigation.

### Multi-stage Docker Build

The production container uses a multi-stage build optimized for Next.js standalone output, reducing the final image size to ~69MB. This minimizes cold-start overhead and pull times during deployments.

### Origin Isolation via Route 53

Route 53 is configured with an `origin.toey-sawatdee.me` A-record pointing directly to the Elastic IP. CloudFront uses this subdomain as its custom origin, bypassing DNS resolution loops that would occur if the main domain's CNAME pointed to CloudFront while CloudFront simultaneously tried to resolve it.

### Infrastructure as Code (Terraform)

The entire AWS infrastructure — VPC, subnet, Internet Gateway, route table, security group, EC2 launch template, Elastic IP, CloudFront distribution, Route 53 records, and IAM roles — is declared in Terraform (AWS Provider 6.x). No manual console changes. The stack is reproducible from a single `terraform apply`.

### Serverless Routing: GET vs POST Isolation

The visitor counter Lambda increments on every HTTP method by default (a common serverless anti-pattern). To prevent F5-spam inflation:

- The frontend POSTs once per browser session to increment the counter
- The result is cached in sessionStorage — subsequent page navigations read from cache with zero API calls
- The Status Page pings AWS health via the Cognito OIDC .well-known endpoint (idempotent, free, zero side effects) instead of hitting Lambda

This keeps DynamoDB read/write costs under $1/month even under continuous polling.

### Data Sanitization & Backend Boundaries

- The Zomboid Lambda returns only a curated { success, data } payload — internal AWS metadata (RequestId, FunctionArn, execution context) is stripped before response
- The Guardian Agent on the game server pushes pre-aggregated metrics (peak players, avg ping, uptime) — raw server logs and filesystem paths never leave the host
- The DecimalEncoder in Python Lambda prevents DynamoDB's Decimal type from crashing JSON serialization — a silent data corruption bug that only surfaces under load

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for production-like builds)

### Installation

```bash
git clone https://github.com/ttser123/toey-sawatdee.git
cd toey-sawatdee
npm ci
```

> Use npm ci, not npm install. This installs from the lockfile exactly, ensuring deterministic builds across machines.

### Environment Variables

Create .env.local in the project root:

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-cognito-client-id
NEXT_PUBLIC_ZOMBOID_API_URL=https://your-lambda-function-url.on.aws/
AWS_REGION=ap-southeast-2
```

> All NEXT_PUBLIC_* variables are embedded into the build at compile time. They contain no privileged credentials — only public-facing API endpoints and Cognito pool identifiers.

### Run

```bash
npm run dev
npm run build
```

### Docker Build

```bash
docker build -t toey-sawatdee .
docker run -p 3000:3000 toey-sawatdee
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.4 (SSR), React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4.2.4 |
| Design System | Custom Blueprint aesthetic — graph-paper grid, tracing-paper cards, monospace metrics |
| Auth | AWS Cognito (SRP + JWT) |
| Compute | AWS EC2 (t3.micro), Docker, CloudFront prefix list SG |
| IaC | Terraform (AWS Provider 6.x) |
| Serverless API | AWS Lambda (Python 3.12) |
| Database | AWS DynamoDB (On-Demand) |
| CDN | AWS CloudFront (custom RSC cache policy) |
| DNS/TLS | AWS Route 53 + ACM |
| CI/CD | GitHub Actions → GHCR → SSM RunCommand (zero-SSH) |
| Game Telemetry | Node.js Guardian Agent on dedicated Linux server |

---

## Security Policy

The following are excluded from version control via .gitignore:

| Pattern | Purpose |
|---------|---------|
| .env* | All environment variable files — API URLs, Cognito IDs, AWS config |
| *.pem | SSL/TLS certificates and private keys |
| .agents/ | Local AI agent configuration and rules |
| .next/, out/ | Build artifacts (reproducible from source) |
| .terraform/, *.tfstate* | Terraform state and provider cache |
| *.tfvars | Terraform variable files with sensitive values |

No credentials, tokens, or secrets should ever be committed. Deployment uses SSM RunCommand — no SSH keys exist on the server or in the repository. GHCR authentication is handled via SSM Parameter Store (encrypted).
