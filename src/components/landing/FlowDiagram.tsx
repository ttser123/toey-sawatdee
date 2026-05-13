// src/components/landing/FlowDiagram.tsx
'use client';

const steps = [
  {
    title: 'Edge & DNS Layer',
    desc: 'Route 53 → CloudFront',
    details: [
      'Resolves domain via AWS Route 53.',
      'CloudFront caches static assets globally.',
      'Terminates SSL at the edge via ACM.',
      'Custom cache policy prevents RSC poisoning.',
    ],
  },
  {
    title: 'Network Isolation',
    desc: 'VPC → Security Group',
    details: [
      'Custom VPC (10.0.0.0/16) isolation.',
      'SG allows Port 80 from CF Prefix List.',
      'Zero direct IP access to origin server.',
      'Elastic IP ensures stable origin connectivity.',
    ],
  },
  {
    title: 'Application Runtime',
    desc: 'Docker → Next.js SSR',
    details: [
      'EC2 (t3.micro) runs Docker container.',
      'Next.js Node server on internal port 3000.',
      'Server-Side Rendering for dynamic pages.',
      'Middleware-level authentication enforcement.',
    ],
  },
  {
    title: 'Serverless Backend',
    desc: 'Cognito & DynamoDB',
    details: [
      'Cognito enforces SRP authentication.',
      'Validates JWT sessions for dashboard.',
      'Lambda ingests asynchronous telemetry.',
      'DynamoDB handles On-Demand persistence.',
    ],
  },
];

export function FlowDiagram() {
  return (
    <div className="card-blueprint p-6 sm:p-8">
      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-8 uppercase tracking-tight border-b border-slate-100 pb-4">
        Infrastructure Pipeline Flow
      </h3>

      {/* Desktop: horizontal pipeline */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-0">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex items-stretch">
            {/* Card */}
            <div className="flex-1 bg-slate-50/60 border border-slate-200 p-5 rounded-sm transition-colors hover:border-indigo-300 relative">
              {/* Step Indicator */}
              <div className="absolute -top-3 -left-2 bg-slate-800 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm">
                NODE 0{idx + 1}
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-2 mt-1">{step.title}</h4>

              <div className="text-[10px] font-mono font-bold text-indigo-700 mb-4 py-1 px-2 bg-indigo-50 border border-indigo-100 rounded-sm inline-block uppercase tracking-tight">
                {step.desc}
              </div>

              <ul className="space-y-2">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                    <span className="text-slate-300 mt-0.5">▹</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connector Arrow */}
            {idx < steps.length - 1 && (
              <div className="flex items-center px-2 shrink-0">
                <svg width="24" height="12" viewBox="0 0 24 12" className="text-slate-300">
                  <line x1="0" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="4,3" />
                  <polygon points="18,2 24,6 18,10" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical pipeline */}
      <div className="lg:hidden space-y-3">
        {steps.map((step, idx) => (
          <div key={step.title}>
            <div className="bg-slate-50/60 border border-slate-200 p-5 rounded-sm transition-colors hover:border-indigo-300 relative">
              {/* Step Indicator */}
              <div className="absolute -top-3 -left-2 bg-slate-800 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm">
                NODE 0{idx + 1}
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-2 mt-1">{step.title}</h4>

              <div className="text-[10px] font-mono font-bold text-indigo-700 mb-4 py-1 px-2 bg-indigo-50 border border-indigo-100 rounded-sm inline-block uppercase tracking-tight">
                {step.desc}
              </div>

              <ul className="space-y-2">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                    <span className="text-slate-300 mt-0.5">▹</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vertical connector */}
            {idx < steps.length - 1 && (
              <div className="flex justify-center py-1.5">
                <svg width="12" height="20" viewBox="0 0 12 20" className="text-slate-300">
                  <line x1="6" y1="0" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeDasharray="4,3" />
                  <polygon points="2,14 6,20 10,14" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
