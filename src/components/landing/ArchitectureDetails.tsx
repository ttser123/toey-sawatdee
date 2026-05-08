// src/components/landing/ArchitectureDetails.tsx
'use client';

interface ZoneProps {
  title: string;
  subtitle: string;
  items: {
    label: string;
    description: string;
  }[];
}

function ZoneCard({ title, subtitle, items }: ZoneProps) {
  return (
    <div className="card-blueprint p-6 transition-colors hover:border-indigo-300">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-[11px] font-mono font-bold text-indigo-500 uppercase tracking-widest">
          {subtitle}
        </p>
      </div>
      <ul className="space-y-4 text-sm text-slate-600">
        {items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            <strong className="text-slate-800 font-semibold">{item.label}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchitectureDetails() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneCard
          title="Zone 1: The Edge"
          subtitle="Global Delivery"
          items={[
            {
              label: "CloudFront",
              description: "Caches static assets globally, slashing load times and offloading compute."
            },
            {
              label: "Route 53",
              description: "Implemented origin isolation to bypass DNS loops, routing traffic safely to EC2."
            },
            {
              label: "ACM",
              description: "Enforced strict SSL/TLS encryption across the edge network."
            }
          ]}
        />

        <ZoneCard
          title="Zone 2: Compute Core"
          subtitle="AWS EC2 (t3.micro)"
          items={[
            {
              label: "Nginx",
              description: "Primary gatekeeper managing headers and secure request proxying."
            },
            {
              label: "Docker",
              description: "Full environment isolation, standardizing production and local states."
            },
            {
              label: "Next.js SSR",
              description: "Server-Side Rendering for dynamic routes and middleware authentication."
            }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneCard
          title="Zone 3: Serverless Backend"
          subtitle="Decoupled Microservices"
          items={[
            {
              label: "Cognito",
              description: "Identity management with JWT/SRP, securing all application routes."
            },
            {
              label: "Lambda",
              description: "Asynchronous telemetry ingestion to preserve main compute performance."
            },
            {
              label: "DynamoDB",
              description: "On-demand NoSQL storage for rapid network state tracking."
            }
          ]}
        />

        <ZoneCard
          title="Zone 4: CI/CD Automation"
          subtitle="Automated Deployment"
          items={[
            {
              label: "Multi-stage Build",
              description: "Optimized standalone output reducing container image size to ~69MB."
            },
            {
              label: "GitHub Actions",
              description: "Automated pipelines pushing to GHCR on every verified merge."
            },
            {
              label: "SSH Orchestration",
              description: "Direct host-level automation for zero-downtime service updates."
            }
          ]}
        />
      </div>
    </div>
  );
}
