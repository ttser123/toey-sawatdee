// src/components/landing/ValueProposition.tsx
'use client';

interface ValueRow {
  metric: string;
  tech: string;
  value: string;
}

const rows: ValueRow[] = [
  {
    metric: 'Security',
    tech: 'Zero-SSH / Secret Manager',
    value:
      'Maximum security: Sensitive data is never exposed. Risk of traditional breaches is minimized via AWS Systems Manager and strictly defined IAM policies.',
  },
  {
    metric: 'Reliability',
    tech: 'IaC (Terraform)',
    value:
      'System stability: Entire environments can be replicated or restored instantly with absolute precision. Disaster recovery is built into the codebase.',
  },
  {
    metric: 'Performance',
    tech: 'Edge Computing (CloudFront)',
    value:
      'User experience: Optimized delivery with sub-millisecond response times globally. Static and dynamic assets are served from the closest edge location.',
  },
  {
    metric: 'Cost & Efficiency',
    tech: 'CI/CD Automation',
    value:
      'Reduced overhead: Minimized manual intervention and server management time. Automated pipelines allow for continuous delivery and rapid iteration.',
  },
];

export function ValueProposition() {
  return (
    <div className="card-blueprint p-6 sm:p-8">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight">
          Why This Architecture Matters
        </h2>
        <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Technical decisions translated into real business outcomes.
        </p>
      </div>

      {/* Value Rows */}
      <div className="grid grid-cols-1 gap-4">
        {rows.map((row) => (
          <div
            key={row.metric}
            className="group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-4 sm:p-5 border border-slate-200 rounded-sm bg-slate-50/60 transition-colors hover:border-indigo-300 hover:bg-white/70"
          >
            {/* Metric Label */}
            <div className="flex flex-col sm:w-48 shrink-0">
              <span className="text-sm font-bold text-slate-800 leading-tight">
                {row.metric}
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                {row.tech}
              </span>
            </div>

            {/* Divider — visible on desktop */}
            <div className="hidden sm:block w-px self-stretch bg-slate-200" />

            {/* Value Description */}
            <p className="text-sm text-slate-600 leading-relaxed flex-1">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
