// src/components/landing/FlowDiagram.tsx
'use client';

export function FlowDiagram() {
  const steps = [
    {
      title: "Edge & DNS Layer",
      desc: "Route 53 ➔ CloudFront",
      details: [
        "Resolves domain via AWS Route 53.",
        "CloudFront caches static assets globally (~50ms latency).",
        "Terminates SSL at the edge via AWS ACM.",
        "Routes dynamic SSR requests through 'origin.*' backdoor."
      ]
    },
    {
      title: "Security Gatekeeper",
      desc: "EC2 ➔ Nginx Proxy",
      details: [
        "AWS EC2 (t3.micro) receives traffic via secure origin.",
        "Nginx intercepts on Port 80 as a reverse proxy.",
        "Sanitizes HTTP headers and prevents direct IP access.",
        "Forwards clean requests to internal localhost bridge."
      ]
    },
    {
      title: "Application Runtime",
      desc: "Docker ➔ Next.js SSR",
      details: [
        "Fully isolated Docker container network.",
        "Next.js Node server executes on internal Port 3000.",
        "Performs Server-Side Rendering (SSR) for dynamic pages.",
        "Executes Next.js Middleware for initial route protection."
      ]
    },
    {
      title: "Serverless Backend",
      desc: "Cognito & API Gateway",
      details: [
        "Decoupled AWS Cognito enforces SRP authentication.",
        "Validates JWT sessions for protected dashboard routes.",
        "API Gateway + Python Lambda ingests telemetry data.",
        "DynamoDB handles On-Demand state persistence."
      ]
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-tight border-b border-slate-100 pb-4">
        <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-1.5 rounded-md">account_tree</span>
        Infrastructure Pipeline Flow
      </h3>

      {/* Pipeline Container */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-4 lg:gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col lg:flex-row items-center lg:items-start flex-1">

            {/* The Node Card */}
            <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-5 rounded-lg transition-all hover:border-indigo-300 hover:shadow-md relative group">
              {/* Step Indicator */}
              <div className="absolute -top-3 -left-2 lg:-left-3 bg-slate-800 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow-sm">
                STEP 0{idx + 1}
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-2 mt-1">{step.title}</h4>

              <div className="text-[10px] font-mono font-bold text-indigo-700 mb-4 py-1 px-2 bg-indigo-50 border border-indigo-100 rounded inline-block uppercase tracking-tight">
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

            {/* The Connector Arrow (Hidden after the last item) */}
            {idx < steps.length - 1 && (
              <div className="flex justify-center items-center py-4 lg:py-0 lg:px-2 lg:h-[200px]">
                {/* ลอจิกใหม่: ลูกศรเดียว มือถือหมุนลง 90 องศา (rotate-90) | จอคอมชี้ขวา (lg:rotate-0) */}
                <span className="material-symbols-outlined text-slate-300 text-3xl rotate-90 lg:rotate-0 transition-transform duration-300 group-hover:text-indigo-400">
                  chevron_right
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}