import React from 'react';

// ── Types ────────────────────────────────────────────────────────────

type ReleaseNote = {
  /** ISO-style or human-readable date string */
  date: string;
  /** ISO date for <time dateTime="..."> (YYYY-MM-DD) */
  isoDate: string;
  title: string;
  changes: string[];
};

// ==========================================
// 🚀 ADD NEW UPDATES HERE (index 0 = latest)
// ==========================================
const releaseNotes: ReleaseNote[] = [
  {
    date: 'May 16, 2026',
    isoDate: '2026-05-16',
    title: 'Subnet Collision Solver (v2.2.0)',
    changes: [
      '**Overview:** Launched a high-performance Network Infrastructure Utility to calculate and avoid IP Collision and Network Exhaustion for Local Environments (Docker/WSL) under dense Corporate Network or VPN constraints.',
      '**Bitwise Range-Jumping Algorithm:** Engineered a core engine leveraging Unsigned Bitwise Operations (`>>> 0`) for near-instant performance—processing 5,000 occupied islands in ~2ms.',
      '**True Lazy Evaluation:** Implemented a TypeScript Generator (`function*`) based architecture to yield only the first 5 candidates on demand, ensuring O(1) constant space complexity regardless of search space size.',
      '**Strict Separation of Concerns (SoC):** Decoupled mathematical pure logic from the UI via a dedicated `useSubnetSolver` custom hook, enabling 100% automated test coverage.',
      '**Dynamic Block Allocation:** Enabled customizable target block sizes from /16 to /28, allowing users to "request only what is needed" to preserve corporate network address space.',
      '**Advanced Boundary Clamping:** Integrated security constraints that prevent the generator from leaking candidates into Public IP ranges.',
      '**Target-Specific Configuration:** Synthesizes ready-to-use implementation code for Docker (`daemon.json`) across Windows, Mac, Linux, and WSL2 (`.wslconfig`).',
      '**Tactical UI Design:** Designed a High-contrast Light Mode interface following the Blueprint Design System, featuring a progressive disclosure flow for configuration details.',
    ]
  },
  {
    date: 'May 13, 2026',
    isoDate: '2026-05-13',
    title: 'The Great Infrastructure Migration (IaC)',
    changes: [
      '**Migration to Terraform:** Transitioned all primary resource management to declarative Infrastructure as Code (HCL). The entire stack is now reproducible with a single `terraform apply` — eliminating manual console errors permanently.',
      '**CloudFront Distribution Orchestration:** Rewrote the full `aws_cloudfront_distribution` block in Terraform to systematically link the CDN with the EC2 origin, enforcing consistent edge-to-origin routing.',
      '**EC2 Identity Fix:** Resolved the "unnamed instance" problem by adding `tags` to `aws_instance` via Terraform, enabling precise CI/CD targeting by tag name instead of fragile instance IDs.',
      '**The Origin Link:** Wired the Elastic IP public DNS directly as the CloudFront origin through IaC, bypassing Route 53 Free Tier management issues entirely.',
      '**Resolved: 504 Gateway Timeout:** Fixed the CloudFront-to-EC2 pipeline blockage by setting `origin_protocol_policy` to `http-only` — the EC2 instance runs HTTP internally with TLS terminated at the edge.',
      '**Next.js RSC Cache Poisoning Fix:** Prevented CloudFront from serving raw RSC JSON payloads as HTML by creating a custom Terraform-managed cache policy that whitelists `rsc`, `next-router-prefetch`, and `Accept` headers as cache key parameters.',
      '**CNAME Conflict Resolution:** Cleaned up orphaned CNAME records left from manual console operations, allowing Terraform to assume full control of the `toey-sawatdee.me` domain mapping.',
      '**Zero-Footprint Secret Management:** Eliminated exposed GitHub tokens from CI/CD logs by migrating to AWS SSM Parameter Store (SecureString) with KMS encryption at rest.',
      '**IAM Least Privilege Implementation:** Authored a dedicated `ssm_parameter_read` policy in Terraform granting EC2 permission to self-retrieve the GHCR token (pull pattern) instead of receiving it externally (push pattern).',
      '**GitHub Actions Shell Overhaul:** Fixed syntax errors in `aws ssm send-command` caused by incorrect backslash escaping. Enforced explicit `--region ap-southeast-2` on all SSM commands for deterministic execution.',
      '**Cleanup:** Purged hardcoded AWS Access Keys from `userdata.sh` and `deploy.yml` — a critical security vulnerability that exposed credentials in plaintext.',
      '**Value Proposition Design:** Introduced a new landing page section translating technical architecture into business outcomes (Security, Reliability, Performance, Cost) for non-technical stakeholders.',
      '**Infrastructure Pipeline Flow:** Redesigned the data flow visualization with static SVG connectors replacing the unstable `getBoundingClientRect` dynamic path calculation.',
    ]
  },
  {
    date: 'May 8, 2026',
    isoDate: '2026-05-08',
    title: 'Next.js SSR Migration & CloudFront Edge Infrastructure',
    changes: [
      '**Overview:** Completely tore down the legacy static hosting architecture and migrated to a production-grade, containerized Server-Side Rendering (SSR) environment on AWS EC2.',
      '**Edge Delivery Network:** Fronted the EC2 instance with AWS CloudFront CDN to cache static assets globally, drastically reducing origin server load and slashing latency to ~50ms.',
      '**Backdoor Origin Routing:** Engineered a custom DNS topology (`origin.toey-sawatdee.me`) to act as a secure backdoor for CloudFront, bypassing infinite routing loop traps.',
      '**Reverse Proxy Implementation:** Configured Nginx as the primary gatekeeper on the EC2 instance, securely intercepting port 80 traffic and proxying it to the internal Docker network.',
      '**Global HTTPS Encryption:** Enforced strict SSL/TLS encryption across the entire application by attaching an AWS ACM Certificate directly to the CloudFront edge network.',
      '**Origin Protection:** Eliminated direct public IP access to the application container; all public traffic must now pass through CloudFront and Nginx security layers.',
      '**Zero-Touch Deployment:** Engineered a fully automated CI/CD pipeline using GitHub Actions, triggering build, publish, and deployment sequences on main branch merges.',
      '**Container Orchestration:** Integrated GitHub Container Registry (GHCR) and automated remote SSH commands to pull new images and restart containers.',
      '**Aggressive Image Optimization:** Implemented multi-stage Docker builds utilizing Next.js standalone mode, reducing final production image size to under 70MB.',
      '**Automated Cache Invalidation:** Integrated CloudFront cache invalidation (`/*`) directly into the deployment pipeline for real-time content updates.',
      '**Deprecations:** Sunset the legacy AWS S3 static site hosting architecture and removed raw EC2 public IP addresses from primary DNS A Records.'
    ]
  },
  {
    date: 'May 8, 2026',
    isoDate: '2026-05-08',
    title: 'Precision Finance Engine & Universal Morph UI',
    changes: [
      '**Universal Inline Morph UI:** Overhauled all ledgers (Assets, Income, Expenses, Goals) with in-place editing. Rows now "morph" into interactive input fields for rapid data adjustment without context switching.',
      '**3-Step Gateway Calculation:** Re-engineered the financial math core to handle recurring monthly, exact one-time matches, and month-only yearly cycles with high precision.',
      '**Embedded Tactical Paginator:** Integrated the month-selection paginator directly into ledger rows for date-sensitive records during the editing phase.',
      '**Radar Lock Sync Protocol:** Deployed a dynamic sync sensor in the HUD that flags out-of-period browsing in Amber and allows instant re-sync with a single click.',
      '**Multi-Phase Validation Engine:** Implemented a robust security layer for data entry: The Ghost Trap (empty labels), The NaN Trap (invalid numbers), and The Negative Asset Trap (logical balance enforcement).',
      '**Zustand Partial Update Engine:** Optimized the state store with surgical update actions (`updateAsset`, `updateIncome`, etc.) for high-performance data mutations.',
      '**Operational Safety Overhaul:** Implemented global deletion protocols with confirmation safeguards and always-visible destruction triggers.'
    ]
  },
  {
    date: 'May 7, 2026',
    isoDate: '2026-05-07',
    title: 'Tactical Finance Tracker & HUD System Integration',
    changes: [
      '**The Vault (Zustand Store):** Implemented a high-performance finance engine with LocalStorage persistence and data versioning (V1) for long-term data integrity.',
      '**Financial Math Engine:** Engineered real-time calculation logic for the 50/30/20 rule, Emergency Runways, and automated Sinking Fund distributions.',
      '**S.M.A.R.T Goal Architecture:** Launched a goal-tracking system with "Lock-in" fund allocation, preventing double-counting of liquid assets and enforcing financial discipline.',
      '**Tactical HUD Header:** Deployed a dynamic `HudHeader` system across all routes, providing contextual titles and navigational orientation.',
      '**Multi-Currency Protocol:** Integrated full support for THB, AUD, USD, and EUR, localized via `Intl.NumberFormat`.',
      '**Administrative Structural Refactor:** Migrated game server dashboards to a secure `/admin` scope and optimized sidebar navigation for authenticated sessions.',
      '**Hydration & Reliability:** Eliminated flickering in stateful dashboard components by implementing a deterministic hydration strategy for persistent store data.'
    ]
  },
  {
    date: 'May 5, 2026',
    isoDate: '2026-05-05',
    title: 'Blueprint Design System & Technical Aesthetics Overhaul',
    changes: [
      '**The Blueprint Grid:** Migrated from solid backgrounds to a 24px precision graph-paper grid across all application routes.',
      '**Tracing Paper Cards:** Implemented semi-translucent (`bg-white/80`) cards with backdrop-blur, allowing background grid lines to bleed through for a premium layered feel.',
      '**The Ink Palette:** Replaced generic colors with a professional "Ink & Paper" palette (Slate-800/300) and Indigo-600 (Printer Blue) accents.',
      '**Monospace Dominance:** Enforced `font-mono` across all metrics, latency values, and technical IDs to emphasize data precision.',
      '**Sharp Edge Architecture:** Purged all shadows and consumer-grade rounded corners, adopting a ruler-sharp `rounded-sm` design system.',
      '**Micro-Interactions:** Engineered a "Radar Pulse" (`animate-radar-ping`) for live status indicators, providing visual feedback of heartbeat synchronization.'
    ]
  },
  {
    date: 'May 3, 2026',
    isoDate: '2026-05-03',
    title: 'Observability & Professional Dashboard Rebranding',
    changes: [
      '**System Status Page:** Launched an enterprise-grade `/status` page with real-time infrastructure health monitoring.',
      '**Live Health Checks:** Integrated authentic status tracking for **AWS Cognito** (via OIDC config) and **CloudFront** (via local asset verification).',
      '**Zero-Cost Latency Tracking:** Implemented API latency monitoring using `OPTIONS` preflight requests to avoid unnecessary Lambda invocations and visitor counter increments.',
      '**Eradicated Layout Shift (CLS):** Refactored Zomboid and Status components to eliminate "Black Hole" hydration flickering by ensuring deterministic SSR states.',
      '**Technical Rebranding:** Purged marketing buzzwords across the site, replacing them with architectural trade-offs and engineering metrics.',
      '**Admin Log:** Renamed "Server Status" to "Admin Log" and standardized the internal dashboard interface.'
    ]
  },
  {
    date: 'May 3, 2026',
    isoDate: '2026-05-03',
    title: 'Zomboid Serverless Infrastructure & Guardian Agent (v2.0)',
    changes: [
      '**AWS Architecture & Backend:** Corrected the Lambda function runtime mismatch (Node.js -> Python 3.12) and fixed the hardcoded AWS Region bug (ap-southeast-2).',
      '**CORS & Security:** Fixed the double-header trap, properly configured AWS HTTP API CORS settings, and removed a useless API Gateway Authorizer blocking the public API.',
      '**DynamoDB Decimal Serialization:** Implemented a custom DecimalEncoder in Python to prevent JSON parsing crashes.',
      '**The Guardian Agent:** Completely rewrote the game server polling script with stateful memory tracking (Peak Players, Total Ping, Uptime).',
      '**Graceful Shutdown:** Added SIGINT and SIGTERM signal listeners to push a final OFFLINE payload to AWS before dying, preventing "Ghost Online" statuses.',
      '**Direct File System Parsing:** Bypassed GameDig limitations by directly reading the Zomboid servertest.ini configuration file to extract and push the active ModsList.',
      '**Frontend React Hydration Fix:** Implemented an isMounted state to prevent server/client rendering mismatches caused by dynamic timestamps.',
      '**Offline Flex Dashboard:** Revamped the UI logic to dynamically shift and show an AWS Serverless Architecture Diagram alongside Last Session Historical Stats during downtime.',
      '**Eradicated Ghost Data Bugs:** Forced conditional rendering to cleanly display 0/0 and 0 ms when the server is down.'
    ]
  },
  {
    date: 'May 2, 2026',
    isoDate: '2026-05-02',
    title: 'Zomboid Dashboard Redesign & Stability',
    changes: [
      'Redesigned **ZomboidStatus** component to always display all stat fields (Map, Players, Ping, Last Update) even when the server is offline — showing zero / placeholder values.',
      'Refactored **Zomboid API route** with graceful offline defaults so the page never renders an error state.',
      'Aligned the Zomboid page to the project **design system** (white cards, Material Symbols icons, consistent spacing).',
      'Converted all Thai text and comments to **English** across the Zomboid module for codebase consistency.',
      'Added an **offline hint banner** explaining auto-refresh behavior to visitors.'
    ]
  },
  {
    date: 'May 2, 2026',
    isoDate: '2026-05-02',
    title: 'Project Zomboid Server Integration',
    changes: [
      'Integrated real-time **Project Zomboid Server Dashboard** into the public view.',
      'Developed backend API polling leveraging the **gamedig** library.',
      'Refactored **ZomboidStatus** component for centralized server monitoring.'
    ]
  },
  {
    date: 'May 1, 2026',
    isoDate: '2026-05-01',
    title: 'Architectural Refactoring & UI Overhaul',
    changes: [
      'Transitioned to a unified **Light Theme** and modernized the typography using the Inter font.',
      'Engineered a **Mobile-First Sidebar** with an interactive slide-over menu and backdrop blur.',
      'Implemented an **Isolated Login Route** with Auth Guard and Callback URLs.'
    ]
  },
  {
    date: 'Apr 28, 2026',
    isoDate: '2026-04-28',
    title: 'Initial Infrastructure Deployment',
    changes: [
      'Configured AWS S3 and CloudFront for global static asset delivery.',
      'Integrated AWS Cognito User Pools for administrator access control.',
      'Established automated CI/CD pipelines via GitHub Actions.'
    ]
  }
];

// ── Fix #4: Content-based stable keys instead of array index ─────────

/**
 * Renders basic markdown-like bold text (**bold text**).
 * Uses content-derived keys instead of array index to prevent
 * React reconciliation bugs on list mutations.
 */
const renderText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`b-${part}`} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
    }
    // Use the content itself as key — guaranteed unique within one split
    return <React.Fragment key={`t-${part}`}>{part}</React.Fragment>;
  });
};

// ── Component ────────────────────────────────────────────────────────

export default function ReleaseNotes() {
  return (
    <>
      <div className="card-blueprint p-6 md:p-8">
        <div className="space-y-8">
          {releaseNotes.map((note, index) => {
            {/* Fix #2: Derive isLatest from position — first item is always latest */ }
            const isLatest = index === 0;
            const isLast = index === releaseNotes.length - 1;
            {/* Stable key from date + title (unique per release) */ }
            const noteKey = `${note.isoDate}-${note.title}`;

            return (
              // Fix #3: Semantic <article> for each release entry
              <article key={noteKey} className="relative">

                {/* ── Fix #1: CSS Grid layout instead of magic-number positioning ── */}
                <div className="grid grid-cols-[auto_1fr] md:grid-cols-[100px_16px_1fr] gap-x-3 md:gap-x-4">

                  {/* ── Date Column ── */}
                  <div className="hidden md:flex items-start justify-end pt-0.5">
                    {/* Fix #3: Semantic <time> element with dateTime attribute */}
                    <time
                      dateTime={note.isoDate}
                      className={`text-sm font-bold font-mono ${isLatest ? 'text-indigo-600' : 'text-slate-500'}`}
                    >
                      {note.date}
                    </time>
                  </div>

                  {/* ── Timeline Track (dot + line) — desktop only ── */}
                  <div className="hidden md:flex flex-col items-center">
                    {/* Dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-4 ring-white/80 shrink-0 mt-1.5 ${isLatest ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    />
                    {/* Line */}
                    {!isLast && (
                      <div className="w-px flex-1 bg-slate-200 mt-1" />
                    )}
                  </div>

                  {/* ── Mobile: date + dot inline row ── */}
                  <div className="flex md:hidden items-center gap-2 col-span-2 mb-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-4 ring-white/80 shrink-0 ${isLatest ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    />
                    <time
                      dateTime={note.isoDate}
                      className={`text-sm font-bold font-mono ${isLatest ? 'text-indigo-600' : 'text-slate-500'}`}
                    >
                      {note.date}
                    </time>
                  </div>

                  {/* ── Content Column ── */}
                  <div className="col-span-2 md:col-span-1 pl-5 md:pl-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-800">{note.title}</h3>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-sm font-mono border border-emerald-200">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Fix #3: Semantic <ul>/<li> instead of <p> with bullet character */}
                    <ul className="space-y-2 text-sm text-slate-600 list-disc list-outside pl-4 marker:text-slate-300">
                      {note.changes.map((change) => (
                        <li key={`${noteKey}-${change.slice(0, 40)}`} className="leading-relaxed pl-1">
                          {renderText(change)}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
