// src/components/landing/HeroSection.tsx
'use client';

export function HeroSection() {
  const categories = [
    { label: 'Frontend', techs: 'Next.js, TypeScript' },
    { label: 'Cloud', techs: 'AWS EC2, CloudFront, DynamoDB' },
    { label: 'Network', techs: 'Nginx, Route 53' },
    { label: 'DevOps', techs: 'Docker, GitHub Actions' },
    { label: 'Security', techs: 'AWS Cognito, ACM' }
  ];

  return (
    <div className="card-blueprint p-6 sm:p-10 relative overflow-hidden group hover:border-indigo-300 transition-colors">
      {/* Background Decoration */}
      <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <span className="material-symbols-outlined text-[200px] text-indigo-600">architecture</span>
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          Web <span className="text-indigo-600 font-mono tracking-tighter">Architecture</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed mb-8">
          A production-grade, server-side rendered application engineered for high availability, zero-downtime deployments, and edge-optimized delivery. Built to demonstrate absolute control over cloud infrastructure.
        </p>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-y-4 gap-x-8 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold font-mono">
          {categories.map((cat) => (
            <div key={cat.label} className="flex flex-col gap-1.5">
              <span className="text-indigo-600">{cat.label}</span>
              <span className="text-slate-500">{cat.techs.split(', ').join(' • ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
