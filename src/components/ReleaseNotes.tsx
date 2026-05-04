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
      return <strong key={`b-${part}`} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    // Use the content itself as key — guaranteed unique within one split
    return <React.Fragment key={`t-${part}`}>{part}</React.Fragment>;
  });
};

// ── Component ────────────────────────────────────────────────────────

export default function ReleaseNotes() {
  return (
    <>
      {/* Changelog & Release Notes Section */}
      <div className="mb-6 flex items-center gap-3 px-1 mt-0">
        <span className="material-symbols-outlined text-gray-400 text-[28px]">update</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Release Notes</h2>
          <p className="text-sm text-gray-500 mt-1">Track recent updates, feature rollouts, and infrastructure changes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="space-y-8">
          {releaseNotes.map((note, index) => {
            {/* Fix #2: Derive isLatest from position — first item is always latest */}
            const isLatest = index === 0;
            const isLast = index === releaseNotes.length - 1;
            {/* Stable key from date + title (unique per release) */}
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
                      className={`text-sm font-bold ${isLatest ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      {note.date}
                    </time>
                  </div>

                  {/* ── Timeline Track (dot + line) — desktop only ── */}
                  <div className="hidden md:flex flex-col items-center">
                    {/* Dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shrink-0 mt-1.5 ${isLatest ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                    {/* Line */}
                    {!isLast && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>

                  {/* ── Mobile: date + dot inline row ── */}
                  <div className="flex md:hidden items-center gap-2 col-span-2 mb-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shrink-0 ${isLatest ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                    <time
                      dateTime={note.isoDate}
                      className={`text-sm font-bold ${isLatest ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      {note.date}
                    </time>
                  </div>

                  {/* ── Content Column ── */}
                  <div className="col-span-2 md:col-span-1 pl-5 md:pl-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{note.title}</h3>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Fix #3: Semantic <ul>/<li> instead of <p> with bullet character */}
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-outside pl-4 marker:text-gray-300">
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
