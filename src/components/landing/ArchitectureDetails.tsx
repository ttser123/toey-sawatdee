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
              description: "Custom cache policy whitelisting RSC, next-router-prefetch, and next-router-state-tree headers to prevent cache poisoning across App Router payloads."
            },
            {
              label: "Route 53",
              description: "Origin isolation via origin.toey-sawatdee.me A-record pointing to Elastic IP, bypassing DNS loops for CloudFront-to-EC2 routing."
            },
            {
              label: "ACM",
              description: "TLS 1.2+ enforced at the edge with SNI-only support, certificate sourced from us-east-1 for CloudFront compatibility."
            }
          ]}
        />

        <ZoneCard
          title="Zone 2: Compute Core"
          subtitle="AWS EC2 (t3.micro)"
          items={[
            {
              label: "Security Group",
              description: "Port 80 ingress locked to CloudFront managed prefix list only — no SSH, no direct IP access."
            },
            {
              label: "Docker",
              description: "Full environment isolation, standalone Next.js output running on internal port 3000, mapped to host port 80."
            },
            {
              label: "Next.js SSR",
              description: "Server-Side Rendering for dynamic routes with middleware-level authentication before page render."
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
          subtitle="Zero-SSH Deployment"
          items={[
            {
              label: "Multi-stage Build",
              description: "Optimized standalone output reducing container image size to ~69MB, pushed to GHCR."
            },
            {
              label: "GitHub Actions",
              description: "Automated pipelines building Docker images and triggering deployment on every verified merge to main."
            },
            {
              label: "SSM RunCommand",
              description: "Zero-SSH deployment — EC2 pulls GHCR token from SSM Parameter Store, no SSH keys exist on the server."
            }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneCard
          title="Zone 5: Infrastructure as Code"
          subtitle="Terraform (AWS Provider 6.x)"
          items={[
            {
              label: "VPC & Networking",
              description: "Custom VPC (10.0.0.0/16), public subnet, Internet Gateway, and Elastic IP — all declared, versioned, and reproducible."
            },
            {
              label: "Launch Template",
              description: "Amazon Linux 2023 AMI auto-resolved to latest, with IAM instance profile for SSM and Parameter Store access."
            },
            {
              label: "Immutable Infra",
              description: "Entire stack — compute, CDN, DNS, IAM — managed as code. No manual console changes."
            }
          ]}
        />
      </div>
    </div>
  );
}
